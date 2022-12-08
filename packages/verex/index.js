import { Router } from "express";

const defaultFormats = {
  image: [
    "apng",
    "avif",
    "gif",
    "jpg",
    "jpeg",
    "jfif",
    "pjpeg",
    "pjp",
    "png",
    "svg",
    "webp",
    "bmp",
    "ico",
    "cur",
    "tif",
    "ttif",
  ],
  video: ["aac", "aawebm", "avi", "wmv", "mov", "mp4"],
  audio: ["wav", "mp3", "ogg"],
};

/**
 * A class to manage the assets in verex
 */
class Assets {
  assetsRouter;

  /**
   * Create an instance of Assets.
   * @param {AssetsFormats} [extraFormats={}] - Assets formats not included.
   * @param {Array<string>} [extraFormats.image] - Image formats not included by default.
   * @param {Array<string>} [extraFormats.video] - Video formats not included by default.
   * @param {Array<string>} [extraFormats.audio] - Audio formats not included by default.
   */
  constructor(extraFormats = {}) {
    this.assetsRouter = Router();

    function createRouteRegex(formats) {
      return new RegExp(`/.+\\.(${formats.join("|")})$`);
    }

    const imageRegex = createRouteRegex(
      defaultFormats.image.concat(extraFormats.image || [])
    );
    this.createRoute(imageRegex);

    const videoRegex = createRouteRegex(
      defaultFormats.video.concat(extraFormats.video || [])
    );
    this.createRoute(videoRegex);

    const audioRegex = createRouteRegex(
      defaultFormats.audio.concat(extraFormats.audio || [])
    );
    this.createRoute(audioRegex);
  }

  /**
   * Create a redirect.
   * @param {RegExp} path - The path to apply the redirect.
   */
  createRoute(path) {
    this.assetsRouter.get(path, (req, res) => {
      const filePath = req.path;
      res.redirect(303, `http://localhost:3000${filePath}`);
    });
  }

  /**
   * Use the assets router in an app.
   * @param app The app to use the router.
   */
  useRouter(app) {
    app.get("/*", this.assetsRouter);
  }
}

export { Assets };
