import os
import zipfile

def pack_project():
    out_dir = os.path.abspath("public/downloads")
    os.makedirs(out_dir, exist_ok=True)
    zip_path = os.path.join(out_dir, "JE-Pink-Chat-Source.zip")

    ignore_dirs = {'.git', 'node_modules', '.cache', '__pycache__', 'dist'}
    ignore_files = {'.DS_Store'}

    root_dir = os.path.abspath(".")

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(root_dir):
            # Prune ignored directories
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            
            for file in files:
                if file in ignore_files or file.endswith('.zip') or file.endswith('.ipa'):
                    continue
                abs_file = os.path.join(root, file)
                rel_file = os.path.relpath(abs_file, root_dir)
                z.write(abs_file, rel_file)

    # Also place at public root and dist root if exists
    dist_dir = os.path.abspath("dist")
    if os.path.exists(dist_dir):
        dist_downloads = os.path.join(dist_dir, "downloads")
        os.makedirs(dist_downloads, exist_ok=True)
        import shutil
        shutil.copy2(zip_path, os.path.join(dist_downloads, "JE-Pink-Chat-Source.zip"))
        shutil.copy2(zip_path, os.path.join(dist_dir, "JE-Pink-Chat-Source.zip"))
    
    import shutil
    shutil.copy2(zip_path, os.path.abspath("public/JE-Pink-Chat-Source.zip"))

    size_kb = os.path.getsize(zip_path) / 1024
    print(f"Created source zip at {zip_path} ({size_kb:.1f} KB)")

if __name__ == "__main__":
    pack_project()
