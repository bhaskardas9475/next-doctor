#define MyAppName "Next Doctor"
#define MyAppVersion "0.1.0"
#define MyAppPublisher "Next Doctor"
#define MyAppExeName "launch.ps1"

[Setup]
AppId={{B4E2B8F7-5BB5-4FA4-B5A4-2F0F7A0CF5B8}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={localappdata}\Programs\NextDoctor
DefaultGroupName={#MyAppName}
OutputDir=output
OutputBaseFilename=setup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
ArchitecturesInstallIn64BitMode=x64
UninstallDisplayIcon={app}\runtime\node.exe

[Files]
Source: "dist\app\*"; DestDir: "{app}\app"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "dist\runtime\*"; DestDir: "{app}\runtime"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "launch.ps1"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\{#MyAppExeName}"""; WorkingDir: "{app}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\{#MyAppExeName}"""; WorkingDir: "{app}"

[Run]
Filename: "powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\{#MyAppExeName}"""; WorkingDir: "{app}"; Description: "Launch {#MyAppName}"; Flags: nowait postinstall skipifsilent
