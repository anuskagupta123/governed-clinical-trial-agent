# Clinexa — Governed Clinical Trial Patient Screening Agent

> **AI-assisted clinical trial screening with deterministic eligibility evaluation, privacy protection, human-review routing, and audit-ready evidence.**

[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-API-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Lyzr](https://img.shields.io/badge/Lyzr-AI%20Agent-6C47FF)](https://www.lyzr.ai/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**GitHub:** https://github.com/anuskagupta123/governed-clinical-trial-agent

---

## Overview

Clinexa is a governed clinical trial patient screening platform designed to transform unstructured clinical trial eligibility criteria and synthetic patient records into **traceable, deterministic screening decisions**.

The system combines:

- **Lyzr Agent** for protocol understanding and structured eligibility criteria extraction
- **Privacy preprocessing** for detecting and redacting PII/PHI before screening
- **Deterministic rule evaluation** for patient eligibility
- **Human-review routing** when required evidence is missing or ambiguous
- **Criterion-level evidence** for every screening decision
- **Audit dossier generation** in JSON and PDF
- **React-based governance dashboard** for screening, audits, protocols, and system governance

The central design principle is:

> **AI interprets the protocol. Deterministic logic evaluates eligibility. Humans handle uncertainty. Every decision leaves an audit trail.**

---

# Problem

Clinical trial recruitment requires matching patient records against detailed inclusion and exclusion criteria.

In conventional workflows, this process can become:

- Manual and time-consuming
- Difficult to audit
- Vulnerable to inconsistent interpretation
- Difficult to reproduce
- Sensitive to missing clinical information
- Challenging to govern when AI is involved

A system that simply asks an LLM:

> "Is this patient eligible?"

can produce an answer without providing a sufficiently structured or reproducible decision trail.

Clinexa addresses this by separating **AI interpretation** from **deterministic decision-making**.

---

# Solution

Clinexa implements a governed screening pipeline:

```text
Clinical Trial Protocol
        │
        ▼
┌──────────────────────┐
│   Lyzr Protocol Agent│
│                      │
│ Extract structured   │
│ eligibility criteria │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Criteria Normalizer  │
│                      │
│ Converts criteria    │
│ into machine rules   │
└──────────┬───────────┘
           │
           │
Synthetic Patient ─────┐
                       ▼
              ┌──────────────────┐
              │ Privacy Layer     │
              │                  │
              │ PII/PHI detection│
              │ & redaction      │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Deterministic    │
              │ Screening Engine │
              └────────┬─────────┘
                       │
             ┌─────────┼──────────┐
             ▼         ▼          ▼
          ELIGIBLE  INELIGIBLE  REQUIRES
                                HUMAN
                                REVIEW
                       │
                       ▼
              ┌──────────────────┐
              │ Audit Dossier    │
              │                  │
              │ JSON + PDF       │
              │ Evidence +       │
              │ Citations        │
              └──────────────────┘
