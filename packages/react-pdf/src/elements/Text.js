import Yoga from 'yoga-layout';
import Base from './Base';
import TextEngine from './TextEngine';

class Text extends Base {
  static defaultProps = {
    wrap: true,
  };

  constructor(root, props) {
    super(root, props);

    this.engine = new TextEngine(this);
    this.layout.setMeasureFunc(this.measureText.bind(this));
  }

  appendChild(child) {
    if (typeof child === 'string') {
      this.children.push(child);
    } else {
      child.parent = this;
      this.children.push(child);
    }
  }

  removeChild(child) {
    this.children = null;
  }

  measureText(width, widthMode, height, heightMode) {
    // If the text has functions inside, we don't measure dimentions right away,
    // but we keep this until all functions are resolved after the layout stage.
    if (this.hasFunctionsInside()) {
      return {};
    }

    if (widthMode === Yoga.MEASURE_MODE_EXACTLY) {
      this.engine.layout(width);

      return {
        height: this.style.flexGrow ? NaN : this.engine.height,
      };
    }

    if (
      widthMode === Yoga.MEASURE_MODE_AT_MOST ||
      heightMode === Yoga.MEASURE_MODE_AT_MOST
    ) {
      this.engine.layout(width);

      return {
        height: this.engine.height,
        width: Math.min(width, this.engine.width),
      };
    }

    return {};
  }

  recalculateLayout() {
    this.layout.markDirty();
  }

  isEmpty() {
    return this.engine.lines.length === 0;
  }

  hasFunctionsInside() {
    return this.children.some(child => child.constructor.name === 'Func');
  }

  get src() {
    return null;
  }

  splice(height) {
    const result = this.clone();
    const engine = this.engine.splice(
      height - this.marginTop - this.paddingTop,
    );

    result.marginTop = 0;
    result.paddingTop = 0;
    result.width = this.width;
    result.marginBottom = this.marginBottom;
    result.engine = engine;
    result.engine.element = result;
    result.height = engine.height + this.paddingBottom + this.marginBottom;

    this.marginBottom = 0;
    this.paddingBottom = 0;
    this.height = height;

    return result;
  }

  async render(page) {
    this.drawBackgroundColor();
    this.drawBorders();

    if (this.props.debug) {
      this.debug();
    }

    this.engine.render();
  }
}

export default Text;
