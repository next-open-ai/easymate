# EasyMate slim Python runtime

This directory defines the optional Python support layer packaged with the
desktop app. It is not an Agent engine and contains no model framework.

The base runtime is generated with:

```bash
node scripts/prepare-python-runtime.mjs
```

It contains portable CPython plus the small `easymate_python_runtime`
document-parser bridge. Heavy document dependencies are installed on demand
under `~/.easymate/components/`; Agent-authored script dependencies are
isolated per workspace under `.python-packages`.
