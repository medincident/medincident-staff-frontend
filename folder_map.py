import sys, os, argparse, fnmatch, re

# Visual assets
PIPE, ELBOW, TEE = "│", "└──", "├──"
PIPE_PREFIX, SPACE_PREFIX = "│   ", "    "

# Default media extensions to skip
MEDIA_EXTENSIONS = {
    '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp', '.tiff',  # Images
    '.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a',                            # Audio
    '.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm',                    # Video
    '.zip', '.tar', '.gz', '.rar', '.7z', '.pdf', '.exe', '.dll', '.so', '.bin' # Binary/Archives
}

def parse_gitignore(path):
    patterns = []
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    patterns.append(line.lstrip('/').rstrip('/'))
    return patterns

def get_file_content(path):
    try:
        if os.path.getsize(path) > 1024 * 1024:
            return "\n[Content skipped: File too large (>1MB)]\n"
        with open(path, 'r', encoding='utf-8') as f:
            return "\n" + f.read() + "\n"
    except (UnicodeDecodeError, PermissionError):
        return "\n[Content skipped: Binary or Non-UTF8]\n"
    except Exception as e:
        return f"\n[Error reading file: {str(e)}]\n"

def generate_tree(dir_path, prefix="", ignore=[], show_files=False, level=None, 
                  depth=0, regex=None, hide_empty=False, no_format=False, 
                  show_content=False, root_path="", include_media=False):
    
    if level is not None and depth >= level: return

    try:
        items = sorted(os.listdir(dir_path), key=lambda x: (not os.path.isdir(os.path.join(dir_path, x)), x.lower()))
    except PermissionError:
        yield f"{prefix}[Access Denied]"
        return

    processed_items = []
    
    for item in items:
        # 1. Global Ignore Check (Gitignore / Default ignores)
        if any(fnmatch.fnmatch(item, p) for p in ignore): continue
        
        full_path = os.path.join(dir_path, item)
        is_dir = os.path.isdir(full_path)

        if not is_dir:
            # 2. Media Filter Check
            _, ext = os.path.splitext(item)
            if not include_media and ext.lower() in MEDIA_EXTENSIONS:
                continue

            # 3. Regex & Show Files Check
            if regex and not re.search(regex, item): continue
            if not show_files and not regex: continue
            
            # Prepare file entry
            entry_text = os.path.relpath(full_path, root_path) if no_format else item

            if show_content:
                entry_text += get_file_content(full_path)

            processed_items.append({'text': entry_text, 'is_dir': False})

        else:
            # Recursively gather children
            sub_lines = list(generate_tree(
                full_path, 
                prefix="" if no_format else prefix,
                ignore=ignore, show_files=show_files, level=level, 
                depth=depth+1, regex=regex, hide_empty=hide_empty, 
                no_format=no_format, show_content=show_content, 
                root_path=root_path, include_media=include_media
            ))
            
            if not hide_empty or sub_lines:
                dir_text = os.path.relpath(full_path, root_path) if no_format else f"{item}/"
                processed_items.append({'text': dir_text, 'is_dir': True, 'lines': sub_lines})

    # Output Generation
    count = len(processed_items)
    for i, entry in enumerate(processed_items):
        if no_format:
            yield entry['text']
            if entry.get('lines'):
                yield from entry['lines']
        else:
            is_last = (i == count - 1)
            connector = ELBOW if is_last else TEE
            yield f"{prefix}{connector} {entry['text']}"
            
            if entry.get('lines'):
                extension = SPACE_PREFIX if is_last else PIPE_PREFIX
                for line in entry['lines']:
                    yield f"{prefix}{extension}{line}"

def main():
    parser = argparse.ArgumentParser(description="Generate folder map.")
    parser.add_argument("-r", "--root", help="Root directory")
    parser.add_argument("-o", "--output", help="Save to file.")
    parser.add_argument("-f", "--show-files", action="store_true", help="Show files.")
    parser.add_argument("-l", "--level", type=int, help="Max recursion depth.")
    parser.add_argument("-m", "--match", help="Regex pattern to filter filenames.")
    parser.add_argument("-g", "--gitignore", nargs='?', const=".gitignore", help="Path to .gitignore.")
    parser.add_argument("--hide-empty", action="store_true", help="Hide empty folders.")
    parser.add_argument("--no-format", action="store_true", help="Output full paths instead of tree.")
    parser.add_argument("-c", "--content", action="store_true", help="Append file content to output.")
    parser.add_argument("--media", action="store_true", help="Include media files (images, audio, video) that are skipped by default.")
    
    parser.set_defaults(show_files=False, hide_empty=False, no_format=False, content=False, media=False, root=os.getcwd())
    
    args = parser.parse_args()
    root = args.root
    
    ignore = [sys.argv[0], '.git']
    if args.output:
        ignore.append(args.output)
    if args.gitignore:
        p = os.path.abspath(args.gitignore) if not os.path.isabs(args.gitignore) else args.gitignore
        ignore.extend(parse_gitignore(p))

    start_line = []
    if not args.no_format:
        start_line = [f"{os.path.basename(root)}/"]

    tree = generate_tree(
        root, ignore=ignore, show_files=args.show_files, 
        level=args.level, regex=args.match, hide_empty=args.hide_empty,
        no_format=args.no_format, show_content=args.content, 
        root_path=root, include_media=args.media
    )
    
    lines = start_line + list(tree)
    output = "\n".join(lines)
    
    print(output)
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(output)
        print(f"✅ Saved to: {args.output}")

if __name__ == "__main__":
    main()