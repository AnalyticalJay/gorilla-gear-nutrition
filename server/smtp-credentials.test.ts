import net from "node:net";
import tls from "node:tls";
import { describe, expect, it } from "vitest";

type SmtpSocket = net.Socket | tls.TLSSocket;

function verifySmtpLogin(): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "465");
  const username = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const implicitTls = process.env.SMTP_SECURE === "true";

  if (!host || !username || !password) {
    throw new Error("SMTP_HOST, SMTP_USER, and SMTP_PASSWORD must be configured for credential validation");
  }

  return new Promise((resolve, reject) => {
    let activeSocket: SmtpSocket | undefined;
    let buffer = "";
    let step: "greeting" | "ehlo_plain" | "starttls" | "ehlo" | "auth" | "username" | "password" | "quit" = "greeting";
    let settled = false;

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      activeSocket?.removeAllListeners();
      activeSocket?.destroy();
      error ? reject(error) : resolve();
    };

    const send = (command: string) => activeSocket?.write(`${command}\r\n`);

    const upgradeToTls = () => {
      const plainSocket = activeSocket;
      if (!plainSocket || plainSocket instanceof tls.TLSSocket) {
        finish(new Error("SMTP STARTTLS upgrade was attempted without a plain socket"));
        return;
      }

      plainSocket.removeAllListeners();
      const secureSocket = tls.connect({ socket: plainSocket, servername: host, rejectUnauthorized: true });
      activeSocket = secureSocket;
      attach(secureSocket);
      secureSocket.once("secureConnect", () => {
        buffer = "";
        step = "ehlo";
        send("EHLO gorillagear.co.za");
      });
    };

    const handleLine = (line: string) => {
      const match = /^(\d{3})([ -])/.exec(line);
      if (!match || match[2] === "-") return;
      const code = Number(match[1]);
      if (code >= 400) {
        finish(new Error(`SMTP authentication failed with response ${code}`));
        return;
      }

      if (step === "greeting" && code === 220) {
        if (implicitTls) {
          step = "ehlo";
          send("EHLO gorillagear.co.za");
        } else {
          step = "ehlo_plain";
          send("EHLO gorillagear.co.za");
        }
      } else if (step === "ehlo_plain" && code === 250) {
        step = "starttls";
        send("STARTTLS");
      } else if (step === "starttls" && code === 220) {
        upgradeToTls();
      } else if (step === "ehlo" && code === 250) {
        step = "auth";
        send("AUTH LOGIN");
      } else if (step === "auth" && code === 334) {
        step = "username";
        send(Buffer.from(username, "utf8").toString("base64"));
      } else if (step === "username" && code === 334) {
        step = "password";
        send(Buffer.from(password, "utf8").toString("base64"));
      } else if (step === "password" && code === 235) {
        step = "quit";
        send("QUIT");
      } else if (step === "quit" && code === 221) {
        finish();
      }
    };

    const attach = (socket: SmtpSocket) => {
      activeSocket = socket;
      socket.setEncoding("utf8");
      socket.setTimeout(10_000);
      socket.on("timeout", () => finish(new Error("SMTP credential validation timed out")));
      socket.on("error", (error) => finish(error));
      socket.on("close", () => {
        if (!settled) finish(new Error("SMTP server closed the connection before authentication completed"));
      });
      socket.on("data", (chunk: string) => {
        buffer += chunk;
        const lines = buffer.split("\r\n");
        buffer = lines.pop() ?? "";
        lines.forEach(handleLine);
      });
    };

    const initialSocket = implicitTls
      ? tls.connect({ host, port, servername: host, timeout: 10_000, rejectUnauthorized: true })
      : net.createConnection({ host, port, timeout: 10_000 });
    attach(initialSocket);
  });
}

describe("SMTP credentials", () => {
  it("authenticates against the configured SMTP server without sending a message", async () => {
    if (process.env.RUN_LIVE_SMTP_TEST !== "true") return;
    expect(["true", "false"]).toContain(process.env.SMTP_SECURE);
    await verifySmtpLogin();
  }, 30_000);
});
