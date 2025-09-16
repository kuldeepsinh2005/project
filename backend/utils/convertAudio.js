const { exec } = require('child_process');

exports.convertWebmToWav = async (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const command = `ffmpeg -y -i "${inputPath}" -ar 16000 -ac 1 -c:a pcm_s16le "${outputPath}"`;

    console.log("[FFMPEG] Running:", command);
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error("[FFMPEG ERROR]:", stderr);
        return reject(err);
      }
      console.log("[FFMPEG SUCCESS]:", outputPath);
      resolve(outputPath);
    });
  });
};
