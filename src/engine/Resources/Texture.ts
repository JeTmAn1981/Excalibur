import { Resource } from './Resource';
import { Promise } from '../Promises';
import { TextureManager, ManagedSprite } from '../Drawing/Index';
/**
 * The [[Texture]] object allows games built in Excalibur to load image resources.
 * [[Texture]] is an [[ILoadable]] which means it can be passed to a [[Loader]]
 * to pre-load before starting a level or game.
 *
 * [[include:Textures.md]]
 */
export class Texture extends Resource<HTMLImageElement> {
  // Texture manager atlas for all texture data
  public static manager: TextureManager = new TextureManager();

  // Texture manager sprite id
  public id: number;

  /**
   * The width of the texture in pixels
   */
  public width: number;

  /**
   * The height of the texture in pixels
   */
  public height: number;

  /**
   * A [[Promise]] that resolves when the Texture is loaded.
   */
  public loaded: Promise<any> = new Promise<any>();

  private _isLoaded: boolean = false;
  private _sprite: ManagedSprite = null;

  /**
   * Populated once loading is complete
   */
  public image: HTMLImageElement;

  /**
   * @param path       Path to the image resource
   * @param bustCache  Optionally load texture with cache busting
   */
  constructor(public path: string, public bustCache = true) {
    super(path, 'blob', bustCache);
    this._sprite = new ManagedSprite(null, null, null, null, null, null);
  }

  /**
   * Returns true if the Texture is completely loaded and is ready
   * to be drawn.
   */
  public isLoaded(): boolean {
    return this._isLoaded;
  }

  /**
   * Begins loading the texture and returns a promise to be resolved on completion
   */
  public load(): Promise<HTMLImageElement> {
    var complete = new Promise<HTMLImageElement>();
    if (this.path.indexOf('data:image/') > -1) {
      this.image = new Image();
      this.image.addEventListener('load', () => {
        this.width = this.image.naturalWidth;
        this.height = this.image.naturalHeight;
        // TODO use ManagedSprite
        this._sprite = Texture.manager.loadIntoAtlas(this);
        // this._sprite = new Sprite(this, 0, 0, this.width, this.height);
        this.loaded.resolve(this.image);
        complete.resolve(this.image);
      });
      this.image.src = this.path;
    } else {
      var loaded = super.load();
      loaded.then(
        () => {
          this.image = new Image();
          this.image.addEventListener('load', () => {
            this._isLoaded = true;
            // TODO use ManagedSprite
            this.width = this.image.naturalWidth;
            this.height = this.image.naturalHeight;
            this.loaded.resolve(this.image);
            complete.resolve(this.image);
          });
          this.image.src = super.getData();
        },
        () => {
          complete.reject('Error loading texture.');
        }
      );
    }
    return complete;
  }

  public asSprite(): ManagedSprite {
    return this._sprite;
  }
}
