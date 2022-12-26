import { Application, Router } from "express";

interface AssetsFormats {
  image?: string[];
  video?: string[];
  audio?: string[];
}

/**
 * A class to manage the assets in verex
 */
class Assets {
  private assetsRouter: Router;

  /**
   * Create an instance of Assets.
   * @param {AssetsFormats} [extraFormats={}] - Assets formats not included.
   * @param {Array<string>} [extraFormats.image] - Image formats not included by default.
   * @param {Array<string>} [extraFormats.video] - Video formats not included by default.
   * @param {Array<string>} [extraFormats.audio] - Audio formats not included by default.
   */
  constructor(extraFormats: AssetsFormats = {});

  /**
   * Create a redirect.
   * @param {RegExp} path - The path to apply the redirect.
   */
  private createRoute(path: RegExp): void;

  /**
   * Use the assets router in an app.
   * @param app The app to use the router.
   */
  useRouter(app: Application): void;
}

export { Assets };
