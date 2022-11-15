import { resolve, join } from "path";
import ffmpegPath from "ffmpeg-static";
import { ffprobePath, TranscodeClient } from "./client";
import { pathExistsSync, removeSync } from "fs-extra";

describe("adapters/transcode/client.client", () => {
  it("has access to ffmpeg", () => {
    expect(ffmpegPath).toEqual(expect.any(String));
  });

  it("has access to ffprobe", () => {
    expect(ffprobePath).toEqual(expect.any(String));
  });

  const client = new TranscodeClient();

  const rootPath = resolve(`${__dirname}/../../../test/adapters/transcode`);
  const filePath = `${rootPath}/a.wav`;

  it("gets the bit depth", () => {
    const result = client.getBitDepth(filePath);
    expect(result).toEqual(8);
  });

  it("gets the bit rate", () => {
    const result = client.getBitRate(filePath);
    expect(result).toEqual(64000);
  });

  it("gets the sample rate", () => {
    const result = client.getSampleRate(filePath);
    expect(result).toEqual(8000);
  });

  it("transcodes to CD ready .wav", () => {
    const inputFilePath = filePath;
    const outputFilePath = join(rootPath, "a_transcoded.wav");

    removeSync(outputFilePath);
    expect(pathExistsSync(outputFilePath)).toEqual(false);

    client.transcodeToCdReadyWav({ inputFilePath, outputFilePath });
    expect(pathExistsSync(outputFilePath)).toEqual(true);

    const bitDepth = client.getBitDepth(outputFilePath);
    const bitRate = client.getBitRate(outputFilePath);
    const sampleRate = client.getSampleRate(outputFilePath);

    expect(bitDepth).toEqual(16);
    expect(bitRate).toEqual(705600);
    expect(sampleRate).toEqual(44100);

    removeSync(outputFilePath);
  });
});
