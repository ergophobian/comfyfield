# Architecture decisions

One file per decision that is hard to reverse, surprising without context, or the result of a real trade-off. Agents read the ADRs for an area before they work in it (see `docs/agents/domain.md`).

## Format

Name files `NNNN-short-title.md`, numbered in order: `0001-instant-never-starts-a-pod.md`.

```md
# Instant never starts a Pod

Status: accepted (2026-10-20). Issue #121.

The decision and its context in a few sentences: what we chose, what we gave up, and why.

## Considered options

- The options we did not pick, one line each, with the reason.
```

A decision that changes later gets a new ADR. Set the old one to `Status: superseded by NNNN`; do not rewrite it.

Use the terms in `GLOSSARY.md`.
