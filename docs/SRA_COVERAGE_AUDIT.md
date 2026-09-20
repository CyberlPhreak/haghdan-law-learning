# SRA SQE coverage audit

Checked on 23 July 2026 against the official SRA/Kaplan SQE assessment pages. This is a scope and format mapping, not SRA approval and not a substitute for item-by-item legal editorial review.

## Specification versions

- Current specification: applicable to assessments from 1 September 2025 through 31 August 2026.
- Published next specification: applicable from 1 September 2026; first used for the October 2026 SQE2 assessment.
- Law and practice cut-off: four calendar months before the first assessment in the relevant assessment window.
- The app includes the published September 2026 transition points: supplied monetary tax values, clearer SQE2 application/research guidance, Property Practice money-laundering coverage, a separate SQE2 ethics feedback category, and every detailed FLK1/FLK2 clarification listed in the annual review.

Official sources:

- SQE1 specification: https://sqe.sra.org.uk/assessments/sqe1-assessments/sqe1-specification
- FLK1: https://sqe.sra.org.uk/assessments/sqe1-assessments/sqe1-specification/flk1
- FLK2: https://sqe.sra.org.uk/assessments/sqe1-assessments/sqe1-specification/flk2
- SQE1 Annex 4 blueprint: https://sqe.sra.org.uk/assessments/sqe1-assessments/sqe1-specification/sqe1-annex4
- SQE1 sample questions: https://sqe.sra.org.uk/assessments/sqe1-assessments/sqe1-sample-questions
- SQE2 specification: https://sqe.sra.org.uk/assessments/sqe2-assessments/sqe2-specification
- SQE2 assessments and criteria: https://sqe.sra.org.uk/assessments/sqe2-assessments/sqe2-specification/sqe2-assessments
- September 2026 changes: https://sqe.sra.org.uk/assessments/sqe1-assessments/sqe1-specification/sqe-changes-sept-2026

## FLK1 mapping

| SRA classification | App pathways | Full mock target |
| --- | --- | ---: |
| Business Law and Practice | Business Law and Practice | 31/180 |
| Dispute Resolution | Dispute Resolution | 31/180 |
| Contract Law | Contract Law | 30/180 |
| Tort | Tort Law | 30/180 |
| Legal System | Legal System + Constitutional, Administrative and EU Law | 30/180 |
| Legal Services | Legal Services and Ethics | 28/180 |

All targets remain inside the official Annex 4 ranges. Ethics and professional conduct are integrated through lessons and application questions rather than isolated to one paper section. Money laundering remains available in FLK1.

## FLK2 mapping

| SRA classification | App pathways | Full mock design |
| --- | --- | --- |
| Property Law and Practice | Property Law and Practice + contextual Solicitors Accounts | 30/180 classification target |
| Wills and Administration of Estates | Wills and Estates + contextual Solicitors Accounts | 30/180 classification target |
| Land Law | Land Law | 30/180 |
| Trusts Law | Trusts Law | 30/180 |
| Criminal Liability | Criminal Liability | 30/180 |
| Criminal Law and Practice | Criminal Law and Practice | 30/180 |

Solicitors Accounts is taught as a visible pathway for learning, but mock selection integrates its questions into Property and Wills contexts because Annex 4 does not treat Accounts as a separate assessment classification.

## Coverage gaps closed in this audit

- Personal bankruptcy in Business Law and Practice.
- Cross-border service, jurisdiction, applicable law and Welsh-language civil procedure.
- Public order law.
- Funding options for legal services.
- Commercial lease grant/assignment, breach remedies and Landlord and Tenant Act 1954 security of tenure.
- Property passing outside an estate.
- Lease/licence and leasehold covenants in Land Law.
- Charitable and non-charitable purpose trusts.
- Knowing receipt, dishonest assistance and third-party trust liability.
- Trusts of the family home, including sole/joint title and quantification.
- Solicitors Accounts questions contextualised across property completion and estate administration.
- September 2026 Business clarifications on entity scope, share redemption/buyback and Corporation Tax.
- September 2026 Property clarifications on search results, sale/assignment contract drafting, exchange formulae, apportionments and LTA 1954 Part II contracting out.
- September 2026 Wills and Probate clarifications on proof of validity, executor eligibility, NCPR priority/evidence, PR duties/protection, IHT incidence and 1975 Act factors.
- September 2026 Trusts clarifications on Re Rose, Strong v Bird, Choithram, and automatic versus presumed resulting trusts.
- September 2026 Criminal Practice clarifications on PACE Code C interviews, bail applications/opposition, hearsay challenges, bad/good character, Newton hearings and youth procedure/sentencing.

## Machine-enforced coverage control

`src/sra-coverage.json` records 113 named requirements: 47 FLK1, 52 FLK2 and 14 SQE2. Each requirement maps to one or more live learning units or a valid SQE2 station. The release check now fails for duplicate requirement IDs, missing unit references, invalid station references, an uncovered FLK unit, a missing assessment group, or loss of SQE2 negotiation practice.

## SQE1 assessment simulation

- 1,068 original five-option questions across 89 FLK learning units.
- Single best answer structure with one best answer and four plausible alternatives.
- Quick 10-question and diagnostic 30-question practice.
- 90-question, 153-minute official-length session simulation.
- 180-question full FLK simulation divided into two independent 90-question, 153-minute sessions.
- Blueprint-balanced selection for non-subject-specific sessions.

The question bank is original HaghDān content. It must never be described as SRA sample questions, official past questions or Kaplan material. Official sample questions should still be used separately to calibrate length and difficulty.

## SQE2 mapping

All six official skills are included:

1. Client interview and attendance note/legal analysis.
2. Advocacy.
3. Case and matter analysis.
4. Legal research.
5. Legal writing.
6. Legal drafting.

The station library contains 24 timed, original practice packs:

- Oral: Property and Wills interviews; Dispute Resolution and Criminal Litigation advocacy.
- Written: analysis, research, writing and drafting across Dispute Resolution, Criminal Litigation, Property Practice, Wills/Probate and Business Organisations.
- Each station includes a file brief, issues, official timing, planning checklist, skills criteria, application-of-law checks, ethics review and self-mark rubric.
- Negotiation is expressly practised in interview/attendance note, case and matter analysis, and legal writing. At least one negotiation exercise is therefore present through every route in which the SRA says negotiation may be assessed.

The live SQE2 assessment contains four oral and twelve written assessments. The app provides a broader practice library so a learner can rehearse every valid skill/context combination; it does not claim to predict the exact station combination in a sitting.

## Publication controls still required

- A practising solicitor or suitably qualified legal editor must review every rule note, explanation and question before commercial publication.
- Tax rates, monetary thresholds, procedural time limits and legislation must be checked against the assessment-window cut-off date.
- The coverage audit must be rerun after every annual SRA FLK update.
- Store copy must retain the independent-product disclaimer and must not imply SRA, Kaplan SQE or Pearson VUE approval.
