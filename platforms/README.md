# Platform Profiles

The learning engine begins by collecting the learner's environment profile.

Platform profiles:
- macOS
- Linux
- Windows

macOS and Linux currently have direct command examples. Windows has a platform profile and conceptual path; the native command adapter is still planned.

A platform profile records:
- operating system
- CPU architecture
- available virtualization/container runtime
- shell familiarity
- Docker availability
- Kubernetes tooling
- Terraform tooling
- cloud credentials capability
- resource constraints

The exercise engine chooses commands and environment adapters from this profile.

The conceptual objective remains platform-neutral whenever possible.
