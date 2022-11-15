import ffmpeg from "ffmpeg-static";
import ffprobe from "ffprobe-static";
const cmd = require("node-cmd");

// helpers

const runCommand = (command: string[]) => {
  const result = cmd.runSync(command.join(" "));
  const { data, err, stderr } = result;

  if (err !== null || stderr !== null) {
    console.log(result);
    throw Error("ERROR");
  }

  return data;
};

// types

export type TranscodeToCdReadyWavParams = {
  inputFilePath: string;
  outputFilePath: string;
};

export interface ITranscodeClient {
  getBitDepth: (filePath: string) => number;
  getBitRate: (filePath: string) => number;
  getSampleRate: (filePath: string) => number;
  transcodeToCdReadyWav: (params: TranscodeToCdReadyWavParams) => void;
}

// client

export const ffmpegPath = ffmpeg as string;
export const ffprobePath = ffprobe.path as string;

export class TranscodeClient {
  public getBitDepth(filePath: string): number {
    const result = runCommand([
      ffprobePath,
      `"${filePath}"`,
      "-select_streams a:0",
      "-show_entries stream=bits_per_sample",
      "-v quiet",
      '-of csv="p=0"',
    ]);

    return parseInt(result);
  }

  public getBitRate(filePath: string): number {
    const result = runCommand([
      ffprobePath,
      `"${filePath}"`,
      "-select_streams a:0",
      "-show_entries stream=bit_rate",
      "-v quiet",
      '-of csv="p=0"',
    ]);

    return parseInt(result);
  }

  public getSampleRate(filePath: string): number {
    const result = runCommand([
      ffprobePath,
      `"${filePath}"`,
      "-select_streams a:0",
      "-show_entries stream=sample_rate",
      "-v quiet",
      '-of csv="p=0"',
    ]);

    return parseInt(result);
  }

  public transcodeToCdReadyWav({
    inputFilePath,
    outputFilePath,
  }: TranscodeToCdReadyWavParams) {
    runCommand([
      ffmpegPath,
      "-i",
      `"${inputFilePath}"`,
      "-ar 44100",
      "-v quiet",
      `"${outputFilePath}"`,
    ]);
  }
}
