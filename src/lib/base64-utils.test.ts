import {
  base64ToBlob,
  dataURLToBlob,
  detectMimeType,
  estimateBytesFromBase64,
  fileToDataURL,
  normalizeBase64Input,
} from "./base64-utils";

function installMockFileReader() {
  class MockFileReader {
    public result: string | ArrayBuffer | null = null;
    public onload:
      | ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown)
      | null = null;
    public onerror:
      | ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown)
      | null = null;

    public readAsDataURL(blob: Blob) {
      void blob
        .arrayBuffer()
        .then((buf) => {
          const b64 = Buffer.from(new Uint8Array(buf)).toString("base64");
          const type = blob.type || "application/octet-stream";
          this.result = `data:${type};base64,${b64}`;
          this.onload?.call(
            this as unknown as FileReader,
            {} as unknown as ProgressEvent<FileReader>
          );
        })
        .catch(() => {
          this.onerror?.call(
            this as unknown as FileReader,
            {} as unknown as ProgressEvent<FileReader>
          );
        });
    }
  }

  // @ts-expect-error - test polyfill
  globalThis.FileReader = MockFileReader;
}

describe("base64-utils", () => {
  it("normalizeBase64Input supports base64 with whitespace", () => {
    const res = normalizeBase64Input(" aGVs \n bG8=  ");
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.isDataURL).toBe(false);
    expect(res.base64).toBe("aGVsbG8=");
  });

  it("normalizeBase64Input supports DataURL", () => {
    const res = normalizeBase64Input(
      "data:text/plain;base64,aGVs bG8=\n"
    );
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.isDataURL).toBe(true);
    expect(res.mimeType).toBe("text/plain");
    expect(res.base64).toBe("aGVsbG8=");
  });

  it("detectMimeType extracts mime type from DataURL", () => {
    expect(detectMimeType("data:image/png;base64,AA==")).toBe("image/png");
    expect(detectMimeType("not-a-data-url")).toBeUndefined();
  });

  it("estimateBytesFromBase64 returns bytes estimate", () => {
    const r1 = estimateBytesFromBase64("aGVsbG8=");
    expect(r1.ok).toBe(true);
    if (!r1.ok) return;
    expect(r1.bytes).toBe(5);

    const r2 = estimateBytesFromBase64("data:text/plain;base64,aGVsbG8=");
    expect(r2.ok).toBe(true);
    if (!r2.ok) return;
    expect(r2.bytes).toBe(5);
  });

  it("base64ToBlob decodes base64 into blob", async () => {
    const res = base64ToBlob("aGVsbG8=", "text/plain");
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.mimeType).toBe("text/plain");
    expect(res.blob.size).toBe(5);
    await expect(res.blob.text()).resolves.toBe("hello");
  });

  it("dataURLToBlob decodes DataURL into blob", async () => {
    const res = dataURLToBlob("data:text/plain;base64,aGVsbG8=");
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.mimeType).toBe("text/plain");
    expect(res.blob.size).toBe(5);
    await expect(res.blob.text()).resolves.toBe("hello");
  });

  it("base64ToBlob rejects overly large input based on maxBytes", () => {
    // 16 base64 chars => about 12 bytes
    const big = "AAAAAAAAAAAAAAAA";
    const res = base64ToBlob(big, "application/octet-stream", { maxBytes: 10 });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("输入过大");
  });

  it("fileToDataURL reads a blob via FileReader", async () => {
    installMockFileReader();
    const blob = new Blob(["hello"], { type: "text/plain" });
    const res = await fileToDataURL(blob);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.dataURL.startsWith("data:text/plain;base64,")).toBe(true);
  });
});

