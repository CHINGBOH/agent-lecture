from __future__ import annotations

import argparse
import ast
import json
from dataclasses import dataclass
from pathlib import Path


@dataclass
class ModuleInfo:
    name: str
    path: Path
    imports: list[str]
    classes: list[str]
    functions: list[str]


def discover_python_modules(root: Path, include_scripts: bool = False) -> dict[str, Path]:
    modules: dict[str, Path] = {}
    for file_path in sorted(root.rglob("*.py")):
        if "__pycache__" in file_path.parts:
            continue
        if not include_scripts and "scripts" in file_path.parts:
            continue
        relative_path = file_path.relative_to(root)
        module_name = relative_path.stem
        modules[module_name] = file_path
    return modules


def extract_local_imports(tree: ast.AST, module_names: set[str]) -> list[str]:
    imports: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                root_name = alias.name.split(".", 1)[0]
                if root_name in module_names and root_name not in imports:
                    imports.append(root_name)
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                root_name = node.module.split(".", 1)[0]
                if root_name in module_names and root_name not in imports:
                    imports.append(root_name)
            elif node.level > 0:
                for alias in node.names:
                    root_name = alias.name.split(".", 1)[0]
                    if root_name in module_names and root_name not in imports:
                        imports.append(root_name)
    return sorted(imports)


def parse_module(file_path: Path, module_names: set[str]) -> ModuleInfo:
    tree = ast.parse(file_path.read_text(encoding="utf-8"), filename=str(file_path))
    classes = sorted(node.name for node in tree.body if isinstance(node, ast.ClassDef))
    functions = sorted(node.name for node in tree.body if isinstance(node, ast.FunctionDef))
    return ModuleInfo(
        name=file_path.stem,
        path=file_path,
        imports=extract_local_imports(tree, module_names),
        classes=classes,
        functions=functions,
    )


def build_module_map(root: Path, include_scripts: bool = False) -> dict[str, ModuleInfo]:
    modules = discover_python_modules(root, include_scripts=include_scripts)
    module_names = set(modules)
    return {name: parse_module(path, module_names) for name, path in modules.items()}


def build_edges(module_map: dict[str, ModuleInfo]) -> list[dict[str, str]]:
    edges: list[dict[str, str]] = []
    for module_name in sorted(module_map):
        for imported_module in module_map[module_name].imports:
            edges.append({"source": module_name, "target": imported_module})
    return edges


def derive_routes(module_map: dict[str, ModuleInfo], max_depth: int = 4) -> list[dict[str, object]]:
    adjacency = {name: info.imports for name, info in module_map.items()}
    incoming_counts = {name: 0 for name in module_map}
    for info in module_map.values():
        for imported_module in info.imports:
            incoming_counts[imported_module] = incoming_counts.get(imported_module, 0) + 1

    preferred_entries = [name for name in ["__init__", "runtime"] if name in module_map]
    entry_points = preferred_entries or sorted(name for name, count in incoming_counts.items() if count == 0)

    routes: list[list[str]] = []
    seen_routes: set[tuple[str, ...]] = set()

    def visit(path: list[str]) -> None:
        last = path[-1]
        next_hops = [candidate for candidate in adjacency.get(last, []) if candidate not in path]
        if len(path) > 1:
            signature = tuple(path)
            if signature not in seen_routes:
                seen_routes.add(signature)
                routes.append(path.copy())
        if len(path) >= max_depth:
            return
        for next_hop in next_hops:
            visit([*path, next_hop])

    for entry_point in entry_points:
        visit([entry_point])

    named_routes: list[dict[str, object]] = []
    for index, route in enumerate(routes, start=1):
        named_routes.append(
            {
                "name": f"route-{index}",
                "modules": route,
            }
        )
    return named_routes


def render_json(module_map: dict[str, ModuleInfo], root: Path) -> str:
    modules = []
    incoming_map = {name: [] for name in module_map}
    for edge in build_edges(module_map):
        incoming_map[edge["target"]].append(edge["source"])

    for module_name in sorted(module_map):
        info = module_map[module_name]
        modules.append(
            {
                "name": info.name,
                "path": str(info.path.relative_to(root)),
                "imports": info.imports,
                "imported_by": sorted(incoming_map.get(info.name, [])),
                "classes": info.classes,
                "functions": info.functions,
            }
        )

    payload = {
        "repo_root": str(root),
        "modules": modules,
        "edges": build_edges(module_map),
        "routes": derive_routes(module_map),
    }
    return json.dumps(payload, ensure_ascii=False, indent=2)


def render_summary(module_map: dict[str, ModuleInfo], root: Path) -> str:
    lines = [f"repo_root: {root}"]
    for module_name in sorted(module_map):
        info = module_map[module_name]
        lines.append(f"module: {module_name}")
        lines.append(f"  path: {info.path.relative_to(root)}")
        lines.append(f"  imports: {', '.join(info.imports) if info.imports else '-'}")
        lines.append(f"  classes: {', '.join(info.classes) if info.classes else '-'}")
        lines.append(f"  functions: {', '.join(info.functions) if info.functions else '-'}")
    return "\n".join(lines)


def render_mermaid(module_map: dict[str, ModuleInfo]) -> str:
    lines = ["flowchart LR"]
    for module_name in sorted(module_map):
        info = module_map[module_name]
        label_lines = [module_name]
        if info.classes:
            label_lines.append("classes: " + ", ".join(info.classes[:3]))
        if info.functions:
            label_lines.append("functions: " + ", ".join(info.functions[:3]))
        label = "<br/>".join(label_lines).replace('"', "'")
        lines.append(f"    {module_name}[\"{label}\"]")

    for module_name in sorted(module_map):
        for imported_module in module_map[module_name].imports:
            lines.append(f"    {module_name} --> {imported_module}")
    return "\n".join(lines)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate static architecture maps for the handmade agent repository.")
    parser.add_argument("command", choices=["summary", "mermaid", "json"], help="Output format.")
    parser.add_argument("--root", default=Path(__file__).resolve().parents[1], type=Path)
    parser.add_argument("--include-scripts", action="store_true")
    return parser


def main() -> None:
    args = build_parser().parse_args()
    root = args.root.resolve()
    module_map = build_module_map(root, include_scripts=args.include_scripts)

    if args.command == "summary":
        print(render_summary(module_map, root))
        return
    if args.command == "mermaid":
        print(render_mermaid(module_map))
        return
    if args.command == "json":
        print(render_json(module_map, root))
        return
    raise ValueError(f"unsupported command: {args.command}")


if __name__ == "__main__":
    main()