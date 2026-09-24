export type Lesson={id:string;title:string;domain:string;objective:string;podcast:string;lab:{objective:string;command:string;challenge:string};recall:string[]};
export const lessons:Lesson[]=[
  {
    "id": "D1.1",
    "title": "Linux Operating Model",
    "domain": "linux",
    "objective": "Kernel, processes, memory, filesystem and file descriptors.",
    "podcast": "podcasts/day-1.txt",
    "lab": {
      "objective": "Kernel, processes, memory, filesystem and file descriptors.",
      "command": "ps aux | head && lsof -i -P -n | head",
      "challenge": "Make one controlled change related to Linux Operating Model, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Linux Operating Model without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D1.2",
    "title": "Terminal as an Engineering Tool",
    "domain": "linux",
    "objective": "Commands, pipes, redirection, process inspection and SSH.",
    "podcast": "podcasts/day-1.txt",
    "lab": {
      "objective": "Commands, pipes, redirection, process inspection and SSH.",
      "command": "ps aux | head && lsof -i -P -n | head",
      "challenge": "Make one controlled change related to Terminal as an Engineering Tool, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Terminal as an Engineering Tool without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D1.3",
    "title": "Processes, Services, Permissions and Logs",
    "domain": "linux",
    "objective": "Processes, services, permissions, environments and logs.",
    "podcast": "podcasts/day-1.txt",
    "lab": {
      "objective": "Processes, services, permissions, environments and logs.",
      "command": "ps aux | head && lsof -i -P -n | head",
      "challenge": "Make one controlled change related to Processes, Services, Permissions and Logs, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Processes, Services, Permissions and Logs without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D1.4",
    "title": "What Is a Network?",
    "domain": "network",
    "objective": "Ethernet, frames, MAC, switches, LAN, broadcast and ARP.",
    "podcast": "podcasts/day-1.txt",
    "lab": {
      "objective": "Ethernet, frames, MAC, switches, LAN, broadcast and ARP.",
      "command": "dig example.com && curl -I https://example.com",
      "challenge": "Make one controlled change related to What Is a Network?, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain What Is a Network? without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D1.5",
    "title": "IP Addresses, Subnets and CIDR",
    "domain": "network",
    "objective": "IPv4, network/host bits, subnetting and CIDR.",
    "podcast": "podcasts/day-1.txt",
    "lab": {
      "objective": "IPv4, network/host bits, subnetting and CIDR.",
      "command": "dig example.com && curl -I https://example.com",
      "challenge": "Make one controlled change related to IP Addresses, Subnets and CIDR, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain IP Addresses, Subnets and CIDR without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D1.6",
    "title": "Routing, Gateways and NAT",
    "domain": "network",
    "objective": "Routing tables, default routes, hops and NAT.",
    "podcast": "podcasts/day-1.txt",
    "lab": {
      "objective": "Routing tables, default routes, hops and NAT.",
      "command": "dig example.com && curl -I https://example.com",
      "challenge": "Make one controlled change related to Routing, Gateways and NAT, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Routing, Gateways and NAT without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D2.1",
    "title": "TCP and UDP",
    "domain": "network",
    "objective": "TCP connections, ports, sockets, reliability and UDP.",
    "podcast": "podcasts/day-2.txt",
    "lab": {
      "objective": "TCP connections, ports, sockets, reliability and UDP.",
      "command": "dig example.com && curl -I https://example.com",
      "challenge": "Make one controlled change related to TCP and UDP, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain TCP and UDP without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D2.2",
    "title": "DNS",
    "domain": "network",
    "objective": "Resolvers, authoritative servers, records and TTL.",
    "podcast": "podcasts/day-2.txt",
    "lab": {
      "objective": "Resolvers, authoritative servers, records and TTL.",
      "command": "dig example.com && curl -I https://example.com",
      "challenge": "Make one controlled change related to DNS, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain DNS without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D2.3",
    "title": "HTTP",
    "domain": "network",
    "objective": "Requests, responses, headers, status codes and HTTP versions.",
    "podcast": "podcasts/day-2.txt",
    "lab": {
      "objective": "Requests, responses, headers, status codes and HTTP versions.",
      "command": "dig example.com && curl -I https://example.com",
      "challenge": "Make one controlled change related to HTTP, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain HTTP without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D2.4",
    "title": "TLS and HTTPS",
    "domain": "network",
    "objective": "Certificates, CA, handshake, authentication and encryption.",
    "podcast": "podcasts/day-2.txt",
    "lab": {
      "objective": "Certificates, CA, handshake, authentication and encryption.",
      "command": "dig example.com && curl -I https://example.com",
      "challenge": "Make one controlled change related to TLS and HTTPS, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain TLS and HTTPS without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D2.5",
    "title": "Why Containers Exist",
    "domain": "docker",
    "objective": "Process isolation, images, layers, containers and registries.",
    "podcast": "podcasts/day-2.txt",
    "lab": {
      "objective": "Process isolation, images, layers, containers and registries.",
      "command": "docker ps && docker network ls",
      "challenge": "Make one controlled change related to Why Containers Exist, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Why Containers Exist without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D2.6",
    "title": "Docker Networking and Storage",
    "domain": "docker",
    "objective": "Container networks, ports, DNS, volumes and healthchecks.",
    "podcast": "podcasts/day-2.txt",
    "lab": {
      "objective": "Container networks, ports, DNS, volumes and healthchecks.",
      "command": "docker ps && docker network ls",
      "challenge": "Make one controlled change related to Docker Networking and Storage, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Docker Networking and Storage without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D2.7",
    "title": "Break Docker",
    "domain": "docker",
    "objective": "Failure-driven container debugging.",
    "podcast": "podcasts/day-2.txt",
    "lab": {
      "objective": "Failure-driven container debugging.",
      "command": "docker ps && docker network ls",
      "challenge": "Make one controlled change related to Break Docker, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Break Docker without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D3.1",
    "title": "Kubernetes Mental Model",
    "domain": "kubernetes",
    "objective": "Cluster, node, pod, deployment, service and reconciliation.",
    "podcast": "podcasts/day-3.txt",
    "lab": {
      "objective": "Cluster, node, pod, deployment, service and reconciliation.",
      "command": "kubectl get pods,svc -A",
      "challenge": "Make one controlled change related to Kubernetes Mental Model, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Kubernetes Mental Model without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D3.2",
    "title": "Kubernetes Networking",
    "domain": "kubernetes",
    "objective": "DNS, load balancing, ingress, services and pod traffic.",
    "podcast": "podcasts/day-3.txt",
    "lab": {
      "objective": "DNS, load balancing, ingress, services and pod traffic.",
      "command": "kubectl get pods,svc -A",
      "challenge": "Make one controlled change related to Kubernetes Networking, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Kubernetes Networking without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D3.3",
    "title": "Kubernetes Configuration and Storage",
    "domain": "kubernetes",
    "objective": "ConfigMap, Secret, volumes and stateful workloads.",
    "podcast": "podcasts/day-3.txt",
    "lab": {
      "objective": "ConfigMap, Secret, volumes and stateful workloads.",
      "command": "kubectl get pods,svc -A",
      "challenge": "Make one controlled change related to Kubernetes Configuration and Storage, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Kubernetes Configuration and Storage without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D3.4",
    "title": "Kubernetes Health and Scaling",
    "domain": "kubernetes",
    "objective": "Probes, requests, limits, replicas, HPA and rollout.",
    "podcast": "podcasts/day-3.txt",
    "lab": {
      "objective": "Probes, requests, limits, replicas, HPA and rollout.",
      "command": "kubectl get pods,svc -A",
      "challenge": "Make one controlled change related to Kubernetes Health and Scaling, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Kubernetes Health and Scaling without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D3.5",
    "title": "Kubernetes Failure Lab",
    "domain": "kubernetes",
    "objective": "CrashLoopBackOff, ImagePullBackOff, OOMKilled and selector errors.",
    "podcast": "podcasts/day-3.txt",
    "lab": {
      "objective": "CrashLoopBackOff, ImagePullBackOff, OOMKilled and selector errors.",
      "command": "kubectl get pods,svc -A",
      "challenge": "Make one controlled change related to Kubernetes Failure Lab, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Kubernetes Failure Lab without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D4.1",
    "title": "Git as a Production Workflow",
    "domain": "cicd",
    "objective": "Branches, commits, PRs, tags, releases, artifacts and rollback.",
    "podcast": "podcasts/day-4.txt",
    "lab": {
      "objective": "Branches, commits, PRs, tags, releases, artifacts and rollback.",
      "command": "git status && git log --oneline -5",
      "challenge": "Make one controlled change related to Git as a Production Workflow, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Git as a Production Workflow without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D4.2",
    "title": "CI/CD Mental Model",
    "domain": "cicd",
    "objective": "Source to artifact to controlled environment promotion.",
    "podcast": "podcasts/day-4.txt",
    "lab": {
      "objective": "Source to artifact to controlled environment promotion.",
      "command": "git status && git log --oneline -5",
      "challenge": "Make one controlled change related to CI/CD Mental Model, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain CI/CD Mental Model without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D4.3",
    "title": "GitHub Actions",
    "domain": "cicd",
    "objective": "Workflow, jobs, steps, runners, cache, artifacts and environments.",
    "podcast": "podcasts/day-4.txt",
    "lab": {
      "objective": "Workflow, jobs, steps, runners, cache, artifacts and environments.",
      "command": "git status && git log --oneline -5",
      "challenge": "Make one controlled change related to GitHub Actions, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain GitHub Actions without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D4.4",
    "title": "Infrastructure as Code",
    "domain": "terraform",
    "objective": "Declarative infrastructure, idempotency, state and drift.",
    "podcast": "podcasts/day-4.txt",
    "lab": {
      "objective": "Declarative infrastructure, idempotency, state and drift.",
      "command": "terraform plan",
      "challenge": "Make one controlled change related to Infrastructure as Code, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Infrastructure as Code without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D4.5",
    "title": "Terraform Lifecycle",
    "domain": "terraform",
    "objective": "Init, plan, review, apply, modules, state and locking.",
    "podcast": "podcasts/day-4.txt",
    "lab": {
      "objective": "Init, plan, review, apply, modules, state and locking.",
      "command": "terraform plan",
      "challenge": "Make one controlled change related to Terraform Lifecycle, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Terraform Lifecycle without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D4.6",
    "title": "Cloud Primitives",
    "domain": "cloud",
    "objective": "Compute, network, storage, identity, databases, queues and cache.",
    "podcast": "podcasts/day-4.txt",
    "lab": {
      "objective": "Compute, network, storage, identity, databases, queues and cache.",
      "command": "curl -I https://example.com",
      "challenge": "Make one controlled change related to Cloud Primitives, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Cloud Primitives without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D5.1",
    "title": "Scaling",
    "domain": "scale",
    "objective": "Vertical/horizontal scaling, statelessness, load balancing and caching.",
    "podcast": "podcasts/day-5.txt",
    "lab": {
      "objective": "Vertical/horizontal scaling, statelessness, load balancing and caching.",
      "command": "curl -I https://example.com",
      "challenge": "Make one controlled change related to Scaling, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Scaling without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D5.2",
    "title": "Databases at Scale",
    "domain": "distributed",
    "objective": "Transactions, MVCC, replication, partitioning, sharding and recovery.",
    "podcast": "podcasts/day-5.txt",
    "lab": {
      "objective": "Transactions, MVCC, replication, partitioning, sharding and recovery.",
      "command": "curl -I https://example.com",
      "challenge": "Make one controlled change related to Databases at Scale, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Databases at Scale without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D5.3",
    "title": "Distributed Systems",
    "domain": "distributed",
    "objective": "Partial failure, consistency, availability, quorum and replication.",
    "podcast": "podcasts/day-5.txt",
    "lab": {
      "objective": "Partial failure, consistency, availability, quorum and replication.",
      "command": "curl -I https://example.com",
      "challenge": "Make one controlled change related to Distributed Systems, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Distributed Systems without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D5.4",
    "title": "Reliability Patterns",
    "domain": "reliability",
    "objective": "Timeouts, retries, backoff, jitter, idempotency and backpressure.",
    "podcast": "podcasts/day-5.txt",
    "lab": {
      "objective": "Timeouts, retries, backoff, jitter, idempotency and backpressure.",
      "command": "curl -I https://example.com",
      "challenge": "Make one controlled change related to Reliability Patterns, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Reliability Patterns without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D5.5",
    "title": "Observability",
    "domain": "sre",
    "objective": "Logs, metrics, traces, SLI, SLO, SLA and error budgets.",
    "podcast": "podcasts/day-5.txt",
    "lab": {
      "objective": "Logs, metrics, traces, SLI, SLO, SLA and error budgets.",
      "command": "curl -I https://example.com",
      "challenge": "Make one controlled change related to Observability, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Observability without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D5.6",
    "title": "Disaster Recovery",
    "domain": "sre",
    "objective": "RPO, RTO, backups, restore, failover and regions.",
    "podcast": "podcasts/day-5.txt",
    "lab": {
      "objective": "RPO, RTO, backups, restore, failover and regions.",
      "command": "curl -I https://example.com",
      "challenge": "Make one controlled change related to Disaster Recovery, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Disaster Recovery without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D5.7",
    "title": "Global-Scale Architecture",
    "domain": "scale",
    "objective": "Multi-region design for very large user populations.",
    "podcast": "podcasts/day-5.txt",
    "lab": {
      "objective": "Multi-region design for very large user populations.",
      "command": "curl -I https://example.com",
      "challenge": "Make one controlled change related to Global-Scale Architecture, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain Global-Scale Architecture without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  },
  {
    "id": "D5.8",
    "title": "The Production Incident",
    "domain": "sre",
    "objective": "Observe, hypothesize, isolate, mitigate, recover and prevent.",
    "podcast": "podcasts/day-5.txt",
    "lab": {
      "objective": "Observe, hypothesize, isolate, mitigate, recover and prevent.",
      "command": "curl -I https://example.com",
      "challenge": "Make one controlled change related to The Production Incident, predict the failure, observe it, and explain the evidence."
    },
    "recall": [
      "Explain The Production Incident without notes.",
      "What is the lowest layer that can explain a failure here?",
      "What observation distinguishes configuration failure from network failure?",
      "What command or metric would you inspect first?",
      "Where does this concept appear in production?"
    ]
  }
];
export const days=[{id:"D1",title:"Linux + Networking Foundations",range:"D1.1–D1.6"},{id:"D2",title:"Networking Protocols + Docker",range:"D2.1–D2.7"},{id:"D3",title:"Kubernetes",range:"D3.1–D3.5"},{id:"D4",title:"CI/CD + Terraform + Cloud",range:"D4.1–D4.6"},{id:"D5",title:"Scale + Distributed Systems + SRE",range:"D5.1–D5.8"}];