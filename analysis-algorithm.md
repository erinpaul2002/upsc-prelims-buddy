# UPSC Prelims 3-Round Mistake Analysis Algorithm

## Core Objective
To **diagnose the exact reason behind every mark gained or lost** in UPSC Prelims by mapping each question to:
- Content knowledge
- Carelessness
- Elimination skill
- Pure logical reasoning  

The system is based on a **3-round solving strategy** and converts raw attempts into **actionable insights**.

---

## Fundamental Principle

> **The round in which a question is FIRST attempted reflects confidence level**  
> **Correct vs incorrect reflects execution quality**

Each question provides two signals:
1. **Confidence Signal** → From the round (R1, R2, R3)
2. **Quality Signal** → From correctness

These signals together identify the **dominant mental skill** involved.

---

## Round Definitions

| Round | Mental State | Attempt Logic |
|------|-------------|---------------|
| **Round 1** | 90–100% sure | Direct knowledge-based attempt |
| **Round 2** | Partial knowledge | 50–50 elimination based |
| **Round 3** | No knowledge | Pure logic / inference |

---

## Skill Buckets Tracked

Each question maps to **exactly one** of the following abilities:

1. **Content Knowledge**
2. **Carefulness**
3. **Elimination Skill**
4. **Pure Logical Reasoning**

---

## Final Classification System

### CATEGORY A — Content Knowledge

#### A1. Skipped Completely → *Content Gap*
- **Condition**
  - Not attempted in any round
- **Interpretation**
  - No usable content knowledge
  - Logic not trusted enough to attempt
- **Diagnosis**
  - Syllabus / revision gap
- **Action**
  - Mandatory topic revision

---

### CATEGORY B — Carelessness (High-Risk Zone)

#### B1. Wrong in Round 1 → *Carelessness Error*
- **Condition**
  - Attempted in Round 1
  - Answer incorrect
- **Interpretation**
  - High confidence but poor execution
- **Common Causes**
  - Misreading statements
  - Option confusion
  - Overconfidence
- **Action**
  - Slow down
  - Keyword scanning
  - 5-second recheck rule

---

### CATEGORY C — Strong Content (Score Foundation)

#### C1. Correct in Round 1 → *Strong Foundation*
- **Condition**
  - Attempted in Round 1
  - Answer correct
- **Interpretation**
  - Solid content + correct judgment
- **Action**
  - Preserve and expand
  - This is your rank-building zone

---

### CATEGORY D — Elimination Skill (50-50 Zone)

#### D1. Correct in Round 2 → *Effective Elimination*
- **Condition**
  - Skipped Round 1
  - Attempted in Round 2
  - Correct
- **Interpretation**
  - Partial knowledge
  - Strong option elimination
- **Action**
  - Practice PYQs
  - Improve statement-level elimination

---

#### D2. Wrong in Round 2 → *Elimination Flaw*
- **Condition**
  - Skipped Round 1
  - Attempted in Round 2
  - Incorrect
- **Interpretation**
  - Incorrect elimination logic
- **Common Causes**
  - Eliminated correct option
  - Trusted weak assumptions
- **Action**
  - Post-test audit:
    - “Why did I remove the correct option?”

---

### CATEGORY E — Pure Logical Reasoning

#### E1. Correct in Round 3 → *Logical Mastery*
- **Condition**
  - First attempt in Round 3
  - Correct
- **Interpretation**
  - No content knowledge
  - Correct inference via logic
- **Action**
  - Preserve ability
  - Use sparingly in actual exam

---

#### E2. Wrong in Round 3 → *Logical Error / Overthinking*
- **Condition**
  - First attempt in Round 3
  - Incorrect
- **Interpretation**
  - Logic unsupported by facts
  - Overthinking
- **Action**
  - Reduce Round 3 attempts
  - Identify false assumptions

---

## Deterministic Rules

- Each question → **exactly one category**
- First attempted round decides confidence signal
- Skipped in all rounds → always **Content Gap**
- Correctness decided only by final answer vs key

---

## Aggregate Performance Metrics (High-Value)

### 1. Content Gap Index
```text
Skipped / Total Questions
````

* Target: **< 15%**

---

### 2. Carelessness Index

```text
Wrong in R1 / Total Wrong
```

* Target: **< 20%**

---

### 3. Elimination Efficiency

```text
Correct R2 / (Correct R2 + Wrong R2)
```

* Target: **≥ 60%**

---

### 4. Logic Risk Ratio

```text
Wrong R3 / Total Attempts
```

* Target: **≤ 5%**

---

### 5. Strategy Discipline Score

```text
(Correct R1 + Correct R2) / Total Correct
```

* Target: **≥ 75%**

---

## Diagnostic Output Examples

* “Major losses due to **carelessness in Round 1** — slow down.”
* “Good elimination skills but **content gaps remain**.”
* “Over-reliance on Round 3 logic — reduce risky attempts.”
* “Healthy strategy — marks coming mainly from R1 + R2.”

---

