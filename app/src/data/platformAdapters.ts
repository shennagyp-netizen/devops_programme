import type { CourseLesson } from "./courseLessons";
import type { PlatformId } from "./programme";

const windowsCommands: Record<string, string> = {
  "B1.1": "Get-Process | Select-Object -First 10; Get-NetTCPConnection | Select-Object -First 10",
  "B1.2": "Resolve-DnsName example.com; Test-NetConnection example.com -Port 443",
  "B1.3": "curl.exe -v https://example.com",
  "B1.4": "docker ps; docker inspect (docker ps -q | Select-Object -First 1)",
  "B1.5": "docker ps; docker inspect (docker ps -q | Select-Object -First 1)",
  "B2.1": "git status; git log --oneline -5",
  "B2.2": "curl.exe -I https://example.com",
  "B2.3": "Compress-Archive -Path .\project-data\* -DestinationPath .\backup-demo.zip; Get-Item .\backup-demo.zip",
  "B3.1": "docker ps",
  "B3.2": "curl.exe -v http://localhost:8080/health",

  "D1.1": "Get-Process | Select-Object -First 10; Get-NetTCPConnection | Select-Object -First 10",
  "D1.2": "Get-Command; Get-Process | Select-Object -First 10",
  "D1.3": "Get-Process | Select-Object -First 10; Get-WinEvent -LogName System -MaxEvents 10",
  "D1.4": "Get-NetAdapter; arp -a",
  "D1.5": "Get-NetIPAddress; Get-NetRoute -AddressFamily IPv4",
  "D1.6": "Get-NetRoute -AddressFamily IPv4; Test-NetConnection example.com -Port 443",
  "D2.1": "Test-NetConnection example.com -Port 443",
  "D2.2": "Resolve-DnsName example.com",
  "D2.3": "curl.exe -I https://example.com",
  "D2.4": "curl.exe -v https://example.com",
  "D2.5": "docker ps; docker network ls",
  "D2.6": "docker ps; docker network ls",
  "D2.7": "docker ps; docker network ls",
  "D3.1": "kubectl get pods,svc -A",
  "D3.2": "kubectl get pods,svc -A",
  "D3.3": "kubectl get pods,svc -A",
  "D3.4": "kubectl get pods,svc -A",
  "D3.5": "kubectl get pods,svc -A",
  "D4.1": "git status; git log --oneline -5",
  "D4.2": "git status; git log --oneline -5",
  "D4.3": "git status; git log --oneline -5",
  "D4.4": "terraform plan",
  "D4.5": "terraform plan",
  "D4.6": "curl.exe -I https://example.com",
  "D5.1": "curl.exe -I https://example.com",
  "D5.2": "curl.exe -I https://example.com",
  "D5.3": "curl.exe -I https://example.com",
  "D5.4": "curl.exe -I https://example.com",
  "D5.5": "curl.exe -I https://example.com",
  "D5.6": "curl.exe -I https://example.com",
  "D5.7": "curl.exe -I https://example.com",
  "D5.8": "curl.exe -I https://example.com",

  "A1.1": "docker stats --no-stream",
  "A1.2": "docker stats --no-stream",
  "A1.3": "curl.exe -I https://example.com",
  "A1.4": "kubectl get nodes",
  "A1.5": "curl.exe -I https://example.com",
  "A1.6": "curl.exe -I https://example.com",
  "A2.1": "kubectl get pods,svc -A",
  "A2.2": "curl.exe -I https://example.com",
  "A2.3": "curl.exe -v https://example.com",
  "A3.1": "curl.exe -I https://example.com",
  "A3.2": "kubectl get pods,svc -A"
};

export function commandForPlatform(
  lesson: Pick<CourseLesson, "id" | "lab" | "platformCommands">,
  platform: PlatformId
) {
  if (platform === "windows") {
    return windowsCommands[lesson.id] ?? lesson.lab.command;
  }

  return lesson.platformCommands[platform] ?? lesson.lab.command;
}
