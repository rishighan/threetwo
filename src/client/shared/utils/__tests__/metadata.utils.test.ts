import { determineCoverFile } from "../metadata.utils";
import { LIBRARY_SERVICE_HOST } from "../../../constants/endpoints";

describe("determineCoverFile", () => {
  it("builds the rawFile cover URL with exactly one slash between host and an absolute cover.filePath", () => {
    const result = determineCoverFile({
      rawFileDetails: {
        name: "Some Comic 001",
        cover: { filePath: "/userdata/covers/Some Comic 001/cover-000.png" },
      },
    });

    expect(result.url).toBe(
      `${LIBRARY_SERVICE_HOST}/userdata/covers/Some%20Comic%20001/cover-000.png`,
    );
    expect(result.url).not.toContain("//userdata");
  });
});
