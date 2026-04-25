name: "✨ I'm using this!"
description: Tell the community that you're using playwright-ai-step in production.
title: "[Community] <Your Company / Project Name> is using playwright-ai-step"
labels: ["community", "showcase"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for using `playwright-ai-step` in production! Sharing your story helps others discover the project and motivates ongoing development.

  - type: input
    id: org
    attributes:
      label: Organization / Project
      description: Name of your company, project, or open-source repo.
      placeholder: e.g., Acme Corp, MyOpenSourceProject
    validations:
      required: true

  - type: input
    id: url
    attributes:
      label: Website / Repository URL
      description: Link to your site or GitHub repo (optional but appreciated).
      placeholder: https://example.com
    validations:
      required: false

  - type: textarea
    id: use-case
    attributes:
      label: How are you using it?
      description: Brief description of your use case (E2E testing, QA automation, CI/CD, etc.).
      placeholder: "We use playwright-ai-step to run nightly E2E tests against our staging environment..."
    validations:
      required: false

  - type: textarea
    id: feedback
    attributes:
      label: Feedback (optional)
      description: Any feedback, feature requests, or tips you'd like to share?
      placeholder: "It would be great if..."
    validations:
      required: false
