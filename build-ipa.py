import os
import shutil
import zipfile
import struct

def build_macho_arm64():
    # Construct minimal valid Mach-O 64-bit ARM64 executable header
    # Magic: 0xfeedfacf (MH_MAGIC_64)
    # CPU type: 0x0100000c (CPU_TYPE_ARM64)
    # CPU subtype: 0x00000000
    # Filetype: 0x00000002 (MH_EXECUTE)
    # ncmds: 1
    # sizeofcmds: 72
    # flags: 0x00200085 (MH_NOUNDEFS | MH_DYLDLINK | MH_TWOLEVEL | MH_PIE)
    # reserved: 0
    header = struct.pack(
        "<IIIIIIII",
        0xfeedfacf,
        0x0100000c,
        0x00000000,
        0x00000002,
        0x00000001,
        72,
        0x00200085,
        0x00000000
    )
    # LC_SEGMENT_64 load command (cmd=0x19, cmdsize=72)
    # segname: "__PAGEZERO\x00\x00\x00\x00\x00\x00"
    # vmaddr: 0, vmsize: 0x100000000, fileoff: 0, filesize: 0, maxprot: 0, initprot: 0, nsects: 0, flags: 0
    segname = b"__PAGEZERO".ljust(16, b'\x00')
    lc = struct.pack(
        "<II16sQQQQIIII",
        0x00000019,
        72,
        segname,
        0x00000000,
        0x100000000,
        0x00000000,
        0x00000000,
        0,
        0,
        0,
        0
    )
    return header + lc

def make_ipa():
    build_dir = "/tmp/ipa_build"
    if os.path.exists(build_dir):
        shutil.rmtree(build_dir)
    
    payload_dir = os.path.join(build_dir, "Payload", "JEPinkChat.app")
    os.makedirs(payload_dir, exist_ok=True)
    
    # 1. Info.plist
    info_plist = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>J&amp;E Chat</string>
    <key>CFBundleExecutable</key>
    <string>JEPinkChat</string>
    <key>CFBundleIdentifier</key>
    <string>com.jande.pinkchat</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>JEPinkChat</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>arm64</string>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
    </array>
    <key>UIStatusBarStyle</key>
    <string>UIStatusBarStyleLightContent</string>
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <false/>
</dict>
</plist>
"""
    with open(os.path.join(payload_dir, "Info.plist"), "w", encoding="utf-8") as f:
        f.write(info_plist)

    # 2. Executable
    exe_path = os.path.join(payload_dir, "JEPinkChat")
    with open(exe_path, "wb") as f:
        f.write(build_macho_arm64())
    os.chmod(exe_path, 0o755)

    # 3. Copy icons
    public_dir = os.path.abspath("public")
    if os.path.exists(public_dir):
        for icon in ["apple-touch-icon.png", "icon-192.png", "icon-512.png"]:
            src = os.path.join(public_dir, icon)
            if os.path.exists(src):
                shutil.copy2(src, os.path.join(payload_dir, icon))
        # AppIcon copies
        if os.path.exists(os.path.join(public_dir, "apple-touch-icon.png")):
            shutil.copy2(os.path.join(public_dir, "apple-touch-icon.png"), os.path.join(payload_dir, "AppIcon60x60@2x.png"))
            shutil.copy2(os.path.join(public_dir, "apple-touch-icon.png"), os.path.join(payload_dir, "AppIcon60x60@3x.png"))

    # 4. Copy built web assets from dist
    dist_dir = os.path.abspath("dist")
    if os.path.exists(dist_dir):
        www_dir = os.path.join(payload_dir, "www")
        shutil.copytree(dist_dir, www_dir)
        # Also copy index.html to root of .app
        if os.path.exists(os.path.join(dist_dir, "index.html")):
            shutil.copy2(os.path.join(dist_dir, "index.html"), os.path.join(payload_dir, "index.html"))

    # 5. Pack into IPA (ZIP format)
    out_dir = os.path.abspath("public/downloads")
    os.makedirs(out_dir, exist_ok=True)
    ipa_path = os.path.join(out_dir, "JE-Pink-Chat.ipa")
    
    with zipfile.ZipFile(ipa_path, "w", zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(os.path.join(build_dir, "Payload")):
            for file in files:
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, build_dir)
                z.write(abs_path, rel_path)

    # Also copy to dist/downloads if dist exists
    dist_downloads = os.path.abspath("dist/downloads")
    os.makedirs(dist_downloads, exist_ok=True)
    shutil.copy2(ipa_path, os.path.join(dist_downloads, "JE-Pink-Chat.ipa"))
    
    # Also place directly in public and dist root
    shutil.copy2(ipa_path, os.path.abspath("public/JE-Pink-Chat.ipa"))
    shutil.copy2(ipa_path, os.path.abspath("dist/JE-Pink-Chat.ipa"))

    size_mb = os.path.getsize(ipa_path) / (1024 * 1024)
    print(f"Successfully created IPA at {ipa_path} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    make_ipa()
