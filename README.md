# Mobius Kit

A Tool Kit Collection for Statistical Programmer in Clinical Trial Projects

## How to Run
Before launch this project, please make sure you have a configuration yaml file like this:
```yaml
pdf_reader: C:\Program Files (x86)\Foxit Software\Foxit PhantomPDF\FoxitPhantomPDF.exe
word_worker: <replace to an integer>
template: <replace to your path of folder template>
```
Then you need to make this file path into a environment vairable:

in Unix:

```bash
$ export MK_CONFIG=D:\\projects\\rusty\\mobius_kit\\.config\\config.yaml
```

in Windows:
```powershell
set MK_CONFIG=D:\\projects\\rusty\\mobius_kit\\.config\\config.yaml
```

Then launch with `cargo tauri dev`:
```bash
$ cargo tauri dev
```