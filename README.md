# zotero-fetch-cli

Fetch bibliography, Fetch PDFs, Sync PDFs. Best served with CICD.

Installation:

```bash
$ npm install -g zotero-fetch-cli
```

Syncing bibliography:

```bash
$ ZOTERO_APIKEY=xxx ZOTERO_USERID=123 zotero-fetch bibliography --format=json bibliography.json
$ ZOTERO_APIKEY=xxx ZOTERO_USERID=123 zotero-fetch bibliography --format=bibtex bibliography.bib
$ ZOTERO_APIKEY=xxx ZOTERO_USERID=123 zotero-fetch attachments dir/for/attachments

```
