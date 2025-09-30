import {
  ChevronDownIcon,
  ChevronUpIcon
} from "./chunk-TZIZ4TGY.js";
import {
  BaseComponent,
  BaseStyle
} from "./chunk-SRHYSKRV.js";
import {
  PrimeTemplate,
  R,
  SharedModule
} from "./chunk-D4WU3ZSK.js";
import {
  animate,
  sequence,
  state,
  style,
  transition,
  trigger
} from "./chunk-NYXSGXOG.js";
import {
  CommonModule,
  NgForOf,
  NgIf,
  NgStyle,
  NgTemplateOutlet
} from "./chunk-KK7TVSHS.js";
import "./chunk-4X6VR2I6.js";
import {
  ANIMATION_MODULE_TYPE,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  DOCUMENT,
  ElementRef,
  EventEmitter,
  Inject,
  Injectable,
  Input,
  NgModule,
  Output,
  RendererFactory2,
  RuntimeError,
  Subject,
  ViewEncapsulation,
  booleanAttribute,
  forwardRef,
  inject,
  setClassMetadata,
  ɵɵInheritDefinitionFeature,
  ɵɵProvidersFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassMap,
  ɵɵcontentQuery,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementContainer,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵgetInheritedFactory,
  ɵɵinject,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵpureFunction1,
  ɵɵqueryRefresh,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate
} from "./chunk-6E2HX3LV.js";
import "./chunk-D7MF2QZF.js";

// node_modules/@angular/animations/fesm2022/animations.mjs
var AnimationBuilder = class _AnimationBuilder {
  static ɵfac = function AnimationBuilder_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AnimationBuilder)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _AnimationBuilder,
    factory: () => (() => inject(BrowserAnimationBuilder))(),
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AnimationBuilder, [{
    type: Injectable,
    args: [{
      providedIn: "root",
      useFactory: () => inject(BrowserAnimationBuilder)
    }]
  }], null, null);
})();
var AnimationFactory = class {
};
var BrowserAnimationBuilder = class _BrowserAnimationBuilder extends AnimationBuilder {
  animationModuleType = inject(ANIMATION_MODULE_TYPE, {
    optional: true
  });
  _nextAnimationId = 0;
  _renderer;
  constructor(rootRenderer, doc) {
    super();
    const typeData = {
      id: "0",
      encapsulation: ViewEncapsulation.None,
      styles: [],
      data: {
        animation: []
      }
    };
    this._renderer = rootRenderer.createRenderer(doc.body, typeData);
    if (this.animationModuleType === null && !isAnimationRenderer(this._renderer)) {
      throw new RuntimeError(3600, (typeof ngDevMode === "undefined" || ngDevMode) && "Angular detected that the `AnimationBuilder` was injected, but animation support was not enabled. Please make sure that you enable animations in your application by calling `provideAnimations()` or `provideAnimationsAsync()` function.");
    }
  }
  build(animation2) {
    const id = this._nextAnimationId;
    this._nextAnimationId++;
    const entry = Array.isArray(animation2) ? sequence(animation2) : animation2;
    issueAnimationCommand(this._renderer, null, id, "register", [entry]);
    return new BrowserAnimationFactory(id, this._renderer);
  }
  static ɵfac = function BrowserAnimationBuilder_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrowserAnimationBuilder)(ɵɵinject(RendererFactory2), ɵɵinject(DOCUMENT));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _BrowserAnimationBuilder,
    factory: _BrowserAnimationBuilder.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrowserAnimationBuilder, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{
    type: RendererFactory2
  }, {
    type: Document,
    decorators: [{
      type: Inject,
      args: [DOCUMENT]
    }]
  }], null);
})();
var BrowserAnimationFactory = class extends AnimationFactory {
  _id;
  _renderer;
  constructor(_id, _renderer) {
    super();
    this._id = _id;
    this._renderer = _renderer;
  }
  create(element, options) {
    return new RendererAnimationPlayer(this._id, element, options || {}, this._renderer);
  }
};
var RendererAnimationPlayer = class {
  id;
  element;
  _renderer;
  parentPlayer = null;
  _started = false;
  constructor(id, element, options, _renderer) {
    this.id = id;
    this.element = element;
    this._renderer = _renderer;
    this._command("create", options);
  }
  _listen(eventName, callback) {
    return this._renderer.listen(this.element, `@@${this.id}:${eventName}`, callback);
  }
  _command(command, ...args) {
    issueAnimationCommand(this._renderer, this.element, this.id, command, args);
  }
  onDone(fn) {
    this._listen("done", fn);
  }
  onStart(fn) {
    this._listen("start", fn);
  }
  onDestroy(fn) {
    this._listen("destroy", fn);
  }
  init() {
    this._command("init");
  }
  hasStarted() {
    return this._started;
  }
  play() {
    this._command("play");
    this._started = true;
  }
  pause() {
    this._command("pause");
  }
  restart() {
    this._command("restart");
  }
  finish() {
    this._command("finish");
  }
  destroy() {
    this._command("destroy");
  }
  reset() {
    this._command("reset");
    this._started = false;
  }
  setPosition(p) {
    this._command("setPosition", p);
  }
  getPosition() {
    return unwrapAnimationRenderer(this._renderer)?.engine?.players[this.id]?.getPosition() ?? 0;
  }
  totalTime = 0;
};
function issueAnimationCommand(renderer, element, id, command, args) {
  renderer.setProperty(element, `@@${id}:${command}`, args);
}
function unwrapAnimationRenderer(renderer) {
  const type = renderer.ɵtype;
  if (type === 0) {
    return renderer;
  } else if (type === 1) {
    return renderer.animationRenderer;
  }
  return null;
}
function isAnimationRenderer(renderer) {
  const type = renderer.ɵtype;
  return type === 0 || type === 1;
}

// node_modules/@primeuix/styles/dist/organizationchart/index.mjs
var style2 = "\n    .p-organizationchart-table {\n        border-spacing: 0;\n        border-collapse: separate;\n        margin: 0 auto;\n    }\n\n    .p-organizationchart-table > tbody > tr > td {\n        text-align: center;\n        vertical-align: top;\n        padding: 0 dt('organizationchart.gutter');\n    }\n\n    .p-organizationchart-node {\n        display: inline-block;\n        position: relative;\n        border: 1px solid dt('organizationchart.node.border.color');\n        background: dt('organizationchart.node.background');\n        color: dt('organizationchart.node.color');\n        padding: dt('organizationchart.node.padding');\n        border-radius: dt('organizationchart.node.border.radius');\n        transition:\n            background dt('organizationchart.transition.duration'),\n            border-color dt('organizationchart.transition.duration'),\n            color dt('organizationchart.transition.duration'),\n            box-shadow dt('organizationchart.transition.duration');\n    }\n\n    .p-organizationchart-node:has(.p-organizationchart-node-toggle-button) {\n        padding: dt('organizationchart.node.toggleable.padding');\n    }\n\n    .p-organizationchart-node.p-organizationchart-node-selectable:not(.p-organizationchart-node-selected):hover {\n        background: dt('organizationchart.node.hover.background');\n        color: dt('organizationchart.node.hover.color');\n    }\n\n    .p-organizationchart-node-selected {\n        background: dt('organizationchart.node.selected.background');\n        color: dt('organizationchart.node.selected.color');\n    }\n\n    .p-organizationchart-node-toggle-button {\n        position: absolute;\n        inset-block-end: calc(-1 * calc(dt('organizationchart.node.toggle.button.size') / 2));\n        margin-inline-start: calc(-1 * calc(dt('organizationchart.node.toggle.button.size') / 2));\n        z-index: 2;\n        inset-inline-start: 50%;\n        user-select: none;\n        cursor: pointer;\n        width: dt('organizationchart.node.toggle.button.size');\n        height: dt('organizationchart.node.toggle.button.size');\n        text-decoration: none;\n        background: dt('organizationchart.node.toggle.button.background');\n        color: dt('organizationchart.node.toggle.button.color');\n        border-radius: dt('organizationchart.node.toggle.button.border.radius');\n        border: 1px solid dt('organizationchart.node.toggle.button.border.color');\n        display: inline-flex;\n        justify-content: center;\n        align-items: center;\n        outline-color: transparent;\n        transition:\n            background dt('organizationchart.transition.duration'),\n            color dt('organizationchart.transition.duration'),\n            border-color dt('organizationchart.transition.duration'),\n            outline-color dt('organizationchart.transition.duration'),\n            box-shadow dt('organizationchart.transition.duration');\n    }\n\n    .p-organizationchart-node-toggle-button:hover {\n        background: dt('organizationchart.node.toggle.button.hover.background');\n        color: dt('organizationchart.node.toggle.button.hover.color');\n    }\n\n    .p-organizationchart-node-toggle-button:focus-visible {\n        box-shadow: dt('breadcrumb.item.focus.ring.shadow');\n        outline: dt('breadcrumb.item.focus.ring.width') dt('breadcrumb.item.focus.ring.style') dt('breadcrumb.item.focus.ring.color');\n        outline-offset: dt('breadcrumb.item.focus.ring.offset');\n    }\n\n    .p-organizationchart-node-toggle-button-icon {\n        position: relative;\n        inset-block-start: 1px;\n    }\n\n    .p-organizationchart-connector-down {\n        margin: 0 auto;\n        height: dt('organizationchart.connector.height');\n        width: 1px;\n        background: dt('organizationchart.connector.color');\n    }\n\n    .p-organizationchart-connector-right {\n        border-radius: 0;\n    }\n\n    .p-organizationchart-connector-left {\n        border-radius: 0;\n        border-inline-end: 1px solid dt('organizationchart.connector.color');\n    }\n\n    .p-organizationchart-connector-top {\n        border-block-start: 1px solid dt('organizationchart.connector.color');\n    }\n\n    .p-organizationchart-node-selectable {\n        cursor: pointer;\n    }\n\n    .p-organizationchart-connectors :nth-child(1 of .p-organizationchart-connector-left) {\n        border-inline-end: 0 none;\n    }\n\n    .p-organizationchart-connectors :nth-last-child(1 of .p-organizationchart-connector-left) {\n        border-start-end-radius: dt('organizationchart.connector.border.radius');\n    }\n\n    .p-organizationchart-connectors :nth-child(1 of .p-organizationchart-connector-right) {\n        border-inline-start: 1px solid dt('organizationchart.connector.color');\n        border-start-start-radius: dt('organizationchart.connector.border.radius');\n    }\n";

// node_modules/primeng/fesm2022/primeng-organizationchart.mjs
var _c0 = ["pOrganizationChartNode", ""];
var _c1 = (a0) => ({
  $implicit: a0
});
var _c2 = (a0) => ({
  first: a0
});
var _c3 = (a0) => ({
  last: a0
});
function OrganizationChartNode_tbody_0_div_4_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div");
    ɵɵtext(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r1.node.label);
  }
}
function OrganizationChartNode_tbody_0_div_5_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function OrganizationChartNode_tbody_0_div_5_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div");
    ɵɵtemplate(1, OrganizationChartNode_tbody_0_div_5_ng_container_1_Template, 1, 0, "ng-container", 4);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r1.chart.getTemplateForNode(ctx_r1.node))("ngTemplateOutletContext", ɵɵpureFunction1(2, _c1, ctx_r1.node));
  }
}
function OrganizationChartNode_tbody_0_ng_container_6_a_1_ng_container_1__svg_svg_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵnamespaceSVG();
    ɵɵelement(0, "svg", 10);
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(5);
    ɵɵclassMap(ctx_r1.cx("nodeToggleButtonIcon"));
    ɵɵattribute("data-pc-section", "nodeTogglerIcon");
  }
}
function OrganizationChartNode_tbody_0_ng_container_6_a_1_ng_container_1__svg_svg_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵnamespaceSVG();
    ɵɵelement(0, "svg", 11);
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(5);
    ɵɵclassMap(ctx_r1.cx("nodeToggleButtonIcon"));
    ɵɵattribute("data-pc-section", "nodeTogglerIcon");
  }
}
function OrganizationChartNode_tbody_0_ng_container_6_a_1_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, OrganizationChartNode_tbody_0_ng_container_6_a_1_ng_container_1__svg_svg_1_Template, 1, 3, "svg", 8)(2, OrganizationChartNode_tbody_0_ng_container_6_a_1_ng_container_1__svg_svg_2_Template, 1, 3, "svg", 9);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(4);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.node.expanded);
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r1.node.expanded);
  }
}
function OrganizationChartNode_tbody_0_ng_container_6_a_1_span_2_1_ng_template_0_Template(rf, ctx) {
}
function OrganizationChartNode_tbody_0_ng_container_6_a_1_span_2_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, OrganizationChartNode_tbody_0_ng_container_6_a_1_span_2_1_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function OrganizationChartNode_tbody_0_ng_container_6_a_1_span_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span");
    ɵɵtemplate(1, OrganizationChartNode_tbody_0_ng_container_6_a_1_span_2_1_Template, 1, 0, null, 4);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(4);
    ɵɵclassMap(ctx_r1.cx("nodeToggleButtonIcon"));
    ɵɵattribute("data-pc-section", "nodeTogglerIcon");
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r1.chart.togglerIconTemplate || ctx_r1.chart._togglerIconTemplate)("ngTemplateOutletContext", ɵɵpureFunction1(5, _c1, ctx_r1.node.expanded));
  }
}
function OrganizationChartNode_tbody_0_ng_container_6_a_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "a", 6);
    ɵɵlistener("click", function OrganizationChartNode_tbody_0_ng_container_6_a_1_Template_a_click_0_listener($event) {
      ɵɵrestoreView(_r3);
      const ctx_r1 = ɵɵnextContext(3);
      return ɵɵresetView(ctx_r1.toggleNode($event, ctx_r1.node));
    })("keydown.enter", function OrganizationChartNode_tbody_0_ng_container_6_a_1_Template_a_keydown_enter_0_listener($event) {
      ɵɵrestoreView(_r3);
      const ctx_r1 = ɵɵnextContext(3);
      return ɵɵresetView(ctx_r1.toggleNode($event, ctx_r1.node));
    })("keydown.space", function OrganizationChartNode_tbody_0_ng_container_6_a_1_Template_a_keydown_space_0_listener($event) {
      ɵɵrestoreView(_r3);
      const ctx_r1 = ɵɵnextContext(3);
      return ɵɵresetView(ctx_r1.toggleNode($event, ctx_r1.node));
    });
    ɵɵtemplate(1, OrganizationChartNode_tbody_0_ng_container_6_a_1_ng_container_1_Template, 3, 2, "ng-container", 0)(2, OrganizationChartNode_tbody_0_ng_container_6_a_1_span_2_Template, 2, 7, "span", 7);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(3);
    ɵɵclassMap(ctx_r1.cx("nodeToggleButton"));
    ɵɵattribute("data-pc-section", "nodeToggler");
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r1.chart.togglerIconTemplate && !ctx_r1.chart._togglerIconTemplate);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.chart.togglerIconTemplate || ctx_r1.chart._togglerIconTemplate);
  }
}
function OrganizationChartNode_tbody_0_ng_container_6_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, OrganizationChartNode_tbody_0_ng_container_6_a_1_Template, 3, 5, "a", 5);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r1.leaf);
  }
}
function OrganizationChartNode_tbody_0_ng_container_11_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵelementStart(1, "td");
    ɵɵelement(2, "div");
    ɵɵelementEnd();
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵattribute("data-pc-section", "lineCell")("colspan", ctx_r1.colspan);
    ɵɵadvance();
    ɵɵclassMap(ctx_r1.cx("connectorDown"));
    ɵɵattribute("data-pc-section", "lineDown");
  }
}
function OrganizationChartNode_tbody_0_ng_container_12_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "td");
    ɵɵtext(1, " ");
    ɵɵelementEnd();
    ɵɵelementStart(2, "td");
    ɵɵtext(3, " ");
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const first_r4 = ctx.first;
    const last_r5 = ctx.last;
    const ctx_r1 = ɵɵnextContext(3);
    ɵɵclassMap(ctx_r1.cx("connectorLeft", ɵɵpureFunction1(6, _c2, first_r4)));
    ɵɵattribute("data-pc-section", "lineLeft");
    ɵɵadvance(2);
    ɵɵclassMap(ctx_r1.cx("connectorRight", ɵɵpureFunction1(8, _c3, last_r5)));
    ɵɵattribute("data-pc-section", "lineRight");
  }
}
function OrganizationChartNode_tbody_0_ng_container_12_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, OrganizationChartNode_tbody_0_ng_container_12_ng_template_1_Template, 4, 10, "ng-template", 12);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵproperty("ngForOf", ctx_r1.node.children);
  }
}
function OrganizationChartNode_tbody_0_td_14_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "td", 13);
    ɵɵelement(1, "table", 14);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const child_r6 = ctx.$implicit;
    const ctx_r1 = ɵɵnextContext(2);
    ɵɵattribute("data-pc-section", "nodeCell");
    ɵɵadvance();
    ɵɵclassMap(ctx_r1.cx("table"));
    ɵɵproperty("node", child_r6)("collapsible", ctx_r1.node.children && ctx_r1.node.children.length > 0 && ctx_r1.collapsible);
  }
}
function OrganizationChartNode_tbody_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "tbody")(1, "tr")(2, "td")(3, "div", 1);
    ɵɵlistener("click", function OrganizationChartNode_tbody_0_Template_div_click_3_listener($event) {
      ɵɵrestoreView(_r1);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.onNodeClick($event, ctx_r1.node));
    });
    ɵɵtemplate(4, OrganizationChartNode_tbody_0_div_4_Template, 2, 1, "div", 0)(5, OrganizationChartNode_tbody_0_div_5_Template, 2, 4, "div", 0)(6, OrganizationChartNode_tbody_0_ng_container_6_Template, 2, 1, "ng-container", 0);
    ɵɵelementEnd()()();
    ɵɵelementStart(7, "tr", 2)(8, "td");
    ɵɵelement(9, "div");
    ɵɵelementEnd()();
    ɵɵelementStart(10, "tr", 2);
    ɵɵtemplate(11, OrganizationChartNode_tbody_0_ng_container_11_Template, 3, 5, "ng-container", 0)(12, OrganizationChartNode_tbody_0_ng_container_12_Template, 2, 1, "ng-container", 0);
    ɵɵelementEnd();
    ɵɵelementStart(13, "tr", 2);
    ɵɵtemplate(14, OrganizationChartNode_tbody_0_td_14_Template, 2, 5, "td", 3);
    ɵɵelementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext();
    ɵɵattribute("data-pc-section", "body");
    ɵɵadvance();
    ɵɵattribute("data-pc-section", "row");
    ɵɵadvance();
    ɵɵattribute("colspan", ctx_r1.colspan)("data-pc-section", "cell");
    ɵɵadvance();
    ɵɵclassMap(ctx_r1.cn(ctx_r1.cx("node"), ctx_r1.node.styleClass));
    ɵɵattribute("data-pc-section", "node");
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r1.chart.getTemplateForNode(ctx_r1.node));
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.chart.getTemplateForNode(ctx_r1.node));
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.collapsible);
    ɵɵadvance();
    ɵɵclassMap(ctx_r1.cx("connectors"));
    ɵɵproperty("ngStyle", ctx_r1.getChildStyle(ctx_r1.node))("@childState", "in");
    ɵɵattribute("data-pc-section", "lines");
    ɵɵadvance();
    ɵɵattribute("data-pc-section", "lineCell")("colspan", ctx_r1.colspan);
    ɵɵadvance();
    ɵɵclassMap(ctx_r1.cx("connectorDown"));
    ɵɵattribute("data-pc-section", "lineDown");
    ɵɵadvance();
    ɵɵclassMap(ctx_r1.cx("connectors"));
    ɵɵproperty("ngStyle", ctx_r1.getChildStyle(ctx_r1.node))("@childState", "in");
    ɵɵattribute("data-pc-section", "lines");
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.node.children && ctx_r1.node.children.length === 1);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.node.children && ctx_r1.node.children.length > 1);
    ɵɵadvance();
    ɵɵclassMap(ctx_r1.cx("nodeChildren"));
    ɵɵproperty("ngStyle", ctx_r1.getChildStyle(ctx_r1.node))("@childState", "in");
    ɵɵattribute("data-pc-section", "nodes");
    ɵɵadvance();
    ɵɵproperty("ngForOf", ctx_r1.node.children);
  }
}
var _c4 = ["togglericon"];
function OrganizationChart_table_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "table", 1);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵclassMap(ctx_r0.cx("table"));
    ɵɵproperty("collapsible", ctx_r0.collapsible)("node", ctx_r0.root);
  }
}
var classes = {
  root: ({
    instance
  }) => ["p-organizationchart p-component", {
    "p-organizationchart-preservespace": instance.preserveSpace
  }],
  table: "p-organizationchart-table",
  node: ({
    instance
  }) => ["p-organizationchart-node", {
    "p-organizationchart-node": true,
    "p-organizationchart-node-selectable": instance.chart.selectionMode && instance.node.selectable !== false,
    "p-organizationchart-node-selected": instance.isSelected()
  }],
  nodeToggleButton: "p-organizationchart-node-toggle-button",
  nodeToggleButtonIcon: "p-organizationchart-node-toggle-button-icon",
  connectors: "p-organizationchart-connectors",
  connectorDown: "p-organizationchart-connector-down",
  connectorLeft: ({
    first
  }) => ["p-organizationchart-connector-left", {
    "p-organizationchart-connector-top": !first
  }],
  connectorRight: ({
    last
  }) => ["p-organizationchart-connector-right", {
    "p-organizationchart-connector-top": !last
  }],
  nodeChildren: "p-organizationchart-node-children"
};
var OrganizationChartStyle = class _OrganizationChartStyle extends BaseStyle {
  name = "organizationchart";
  theme = style2;
  classes = classes;
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵOrganizationChartStyle_BaseFactory;
    return function OrganizationChartStyle_Factory(__ngFactoryType__) {
      return (ɵOrganizationChartStyle_BaseFactory || (ɵOrganizationChartStyle_BaseFactory = ɵɵgetInheritedFactory(_OrganizationChartStyle)))(__ngFactoryType__ || _OrganizationChartStyle);
    };
  })();
  static ɵprov = ɵɵdefineInjectable({
    token: _OrganizationChartStyle,
    factory: _OrganizationChartStyle.ɵfac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(OrganizationChartStyle, [{
    type: Injectable
  }], null, null);
})();
var OrganizationChartClasses;
(function(OrganizationChartClasses2) {
  OrganizationChartClasses2["root"] = "p-organizationchart";
  OrganizationChartClasses2["table"] = "p-organizationchart-table";
  OrganizationChartClasses2["node"] = "p-organizationchart-node";
  OrganizationChartClasses2["nodeToggleButton"] = "p-organizationchart-node-toggle-button";
  OrganizationChartClasses2["nodeToggleButtonIcon"] = "p-organizationchart-node-toggle-button-icon";
  OrganizationChartClasses2["connectors"] = "p-organizationchart-connectors";
  OrganizationChartClasses2["connectorDown"] = "p-organizationchart-connector-down";
  OrganizationChartClasses2["connectorLeft"] = "p-organizationchart-connector-left";
  OrganizationChartClasses2["connectorRight"] = "p-organizationchart-connector-right";
  OrganizationChartClasses2["nodeChildren"] = "p-organizationchart-node-children";
})(OrganizationChartClasses || (OrganizationChartClasses = {}));
var OrganizationChartNode = class _OrganizationChartNode extends BaseComponent {
  cd;
  node;
  root;
  first;
  last;
  collapsible;
  chart;
  subscription;
  _componentStyle = inject(OrganizationChartStyle);
  constructor(chart, cd) {
    super();
    this.cd = cd;
    this.chart = chart;
    this.subscription = this.chart.selectionSource$.subscribe(() => {
      this.cd.markForCheck();
    });
  }
  get leaf() {
    if (this.node) {
      return this.node.leaf == false ? false : !(this.node.children && this.node.children.length);
    }
  }
  get colspan() {
    if (this.node) {
      return this.node.children && this.node.children.length ? this.node.children.length * 2 : null;
    }
  }
  getChildStyle(node) {
    return {
      visibility: !this.leaf && node.expanded ? "inherit" : "hidden"
    };
  }
  onNodeClick(event, node) {
    this.chart.onNodeClick(event, node);
  }
  toggleNode(event, node) {
    node.expanded = !node.expanded;
    if (node.expanded) this.chart.onNodeExpand.emit({
      originalEvent: event,
      node: this.node
    });
    else this.chart.onNodeCollapse.emit({
      originalEvent: event,
      node: this.node
    });
    event.preventDefault();
  }
  isSelected() {
    return this.chart.isSelected(this.node);
  }
  ngOnDestroy() {
    super.ngOnDestroy();
    this.subscription.unsubscribe();
  }
  static ɵfac = function OrganizationChartNode_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _OrganizationChartNode)(ɵɵdirectiveInject(forwardRef(() => OrganizationChart)), ɵɵdirectiveInject(ChangeDetectorRef));
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _OrganizationChartNode,
    selectors: [["", "pOrganizationChartNode", ""]],
    inputs: {
      node: "node",
      root: [2, "root", "root", booleanAttribute],
      first: [2, "first", "first", booleanAttribute],
      last: [2, "last", "last", booleanAttribute],
      collapsible: [2, "collapsible", "collapsible", booleanAttribute]
    },
    features: [ɵɵProvidersFeature([OrganizationChartStyle]), ɵɵInheritDefinitionFeature],
    attrs: _c0,
    decls: 1,
    vars: 1,
    consts: [[4, "ngIf"], [3, "click"], [3, "ngStyle"], ["colspan", "2", 4, "ngFor", "ngForOf"], [4, "ngTemplateOutlet", "ngTemplateOutletContext"], ["tabindex", "0", 3, "class", "click", "keydown.enter", "keydown.space", 4, "ngIf"], ["tabindex", "0", 3, "click", "keydown.enter", "keydown.space"], [3, "class", 4, "ngIf"], ["data-p-icon", "chevron-down", 3, "class", 4, "ngIf"], ["data-p-icon", "chevron-up", 3, "class", 4, "ngIf"], ["data-p-icon", "chevron-down"], ["data-p-icon", "chevron-up"], ["ngFor", "", 3, "ngForOf"], ["colspan", "2"], ["pOrganizationChartNode", "", 3, "node", "collapsible"]],
    template: function OrganizationChartNode_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵtemplate(0, OrganizationChartNode_tbody_0_Template, 15, 33, "tbody", 0);
      }
      if (rf & 2) {
        ɵɵproperty("ngIf", ctx.node);
      }
    },
    dependencies: [_OrganizationChartNode, CommonModule, NgForOf, NgIf, NgTemplateOutlet, NgStyle, ChevronDownIcon, ChevronUpIcon, SharedModule],
    encapsulation: 2,
    data: {
      animation: [trigger("childState", [state("in", style({
        opacity: 1
      })), transition("void => *", [style({
        opacity: 0
      }), animate(150)]), transition("* => void", [animate(150, style({
        opacity: 0
      }))])])]
    }
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(OrganizationChartNode, [{
    type: Component,
    args: [{
      selector: "[pOrganizationChartNode]",
      standalone: true,
      imports: [CommonModule, ChevronDownIcon, ChevronUpIcon, SharedModule],
      template: `
        <tbody *ngIf="node" [attr.data-pc-section]="'body'">
            <tr [attr.data-pc-section]="'row'">
                <td [attr.colspan]="colspan" [attr.data-pc-section]="'cell'">
                    <div [class]="cn(cx('node'), node.styleClass)" (click)="onNodeClick($event, node)" [attr.data-pc-section]="'node'">
                        <div *ngIf="!chart.getTemplateForNode(node)">{{ node.label }}</div>
                        <div *ngIf="chart.getTemplateForNode(node)">
                            <ng-container *ngTemplateOutlet="chart.getTemplateForNode(node); context: { $implicit: node }"></ng-container>
                        </div>
                        <ng-container *ngIf="collapsible">
                            <a
                                *ngIf="!leaf"
                                tabindex="0"
                                [class]="cx('nodeToggleButton')"
                                (click)="toggleNode($event, node)"
                                (keydown.enter)="toggleNode($event, node)"
                                (keydown.space)="toggleNode($event, node)"
                                [attr.data-pc-section]="'nodeToggler'"
                            >
                                <ng-container *ngIf="!chart.togglerIconTemplate && !chart._togglerIconTemplate">
                                    <svg data-p-icon="chevron-down" *ngIf="node.expanded" [class]="cx('nodeToggleButtonIcon')" [attr.data-pc-section]="'nodeTogglerIcon'" />
                                    <svg data-p-icon="chevron-up" *ngIf="!node.expanded" [class]="cx('nodeToggleButtonIcon')" [attr.data-pc-section]="'nodeTogglerIcon'" />
                                </ng-container>
                                <span [class]="cx('nodeToggleButtonIcon')" *ngIf="chart.togglerIconTemplate || chart._togglerIconTemplate" [attr.data-pc-section]="'nodeTogglerIcon'">
                                    <ng-template *ngTemplateOutlet="chart.togglerIconTemplate || chart._togglerIconTemplate; context: { $implicit: node.expanded }"></ng-template>
                                </span>
                            </a>
                        </ng-container>
                    </div>
                </td>
            </tr>
            <tr [ngStyle]="getChildStyle(node)" [class]="cx('connectors')" [@childState]="'in'" [attr.data-pc-section]="'lines'">
                <td [attr.data-pc-section]="'lineCell'" [attr.colspan]="colspan">
                    <div [attr.data-pc-section]="'lineDown'" [class]="cx('connectorDown')"></div>
                </td>
            </tr>
            <tr [ngStyle]="getChildStyle(node)" [class]="cx('connectors')" [@childState]="'in'" [attr.data-pc-section]="'lines'">
                <ng-container *ngIf="node.children && node.children.length === 1">
                    <td [attr.data-pc-section]="'lineCell'" [attr.colspan]="colspan">
                        <div [attr.data-pc-section]="'lineDown'" [class]="cx('connectorDown')"></div>
                    </td>
                </ng-container>
                <ng-container *ngIf="node.children && node.children.length > 1">
                    <ng-template ngFor let-child [ngForOf]="node.children" let-first="first" let-last="last">
                        <td [attr.data-pc-section]="'lineLeft'" [class]="cx('connectorLeft', { first })">&nbsp;</td>
                        <td [attr.data-pc-section]="'lineRight'" [class]="cx('connectorRight', { last })">&nbsp;</td>
                    </ng-template>
                </ng-container>
            </tr>
            <tr [ngStyle]="getChildStyle(node)" [class]="cx('nodeChildren')" [@childState]="'in'" [attr.data-pc-section]="'nodes'">
                <td *ngFor="let child of node.children" colspan="2" [attr.data-pc-section]="'nodeCell'">
                    <table [class]="cx('table')" pOrganizationChartNode [node]="child" [collapsible]="node.children && node.children.length > 0 && collapsible"></table>
                </td>
            </tr>
        </tbody>
    `,
      animations: [trigger("childState", [state("in", style({
        opacity: 1
      })), transition("void => *", [style({
        opacity: 0
      }), animate(150)]), transition("* => void", [animate(150, style({
        opacity: 0
      }))])])],
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.Default,
      providers: [OrganizationChartStyle]
    }]
  }], () => [{
    type: OrganizationChart,
    decorators: [{
      type: Inject,
      args: [forwardRef(() => OrganizationChart)]
    }]
  }, {
    type: ChangeDetectorRef
  }], {
    node: [{
      type: Input
    }],
    root: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    first: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    last: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    collapsible: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }]
  });
})();
var OrganizationChart = class _OrganizationChart extends BaseComponent {
  el;
  cd;
  /**
   * An array of nested TreeNodes.
   * @group Props
   */
  value;
  /**
   * Style class of the component.
   * @deprecated since v20.0.0, use `class` instead.
   * @group Props
   */
  styleClass;
  /**
   * Defines the selection mode.
   * @group Props
   */
  selectionMode;
  /**
   * Whether the nodes can be expanded or toggled.
   * @group Props
   */
  collapsible;
  /**
   * Whether the space allocated by a node is preserved when hidden.
   * @deprecated since v20.0.0.
   * @group Props
   */
  preserveSpace = true;
  /**
   * A single treenode instance or an array to refer to the selections.
   * @group Props
   */
  get selection() {
    return this._selection;
  }
  set selection(val) {
    this._selection = val;
    if (this.initialized) this.selectionSource.next(null);
  }
  /**
   * Callback to invoke on selection change.
   * @param {*} any - selected value.
   * @group Emits
   */
  selectionChange = new EventEmitter();
  /**
   * Callback to invoke when a node is selected.
   * @param {OrganizationChartNodeSelectEvent} event - custom node select event.
   * @group Emits
   */
  onNodeSelect = new EventEmitter();
  /**
   * Callback to invoke when a node is unselected.
   * @param {OrganizationChartNodeUnSelectEvent} event - custom node unselect event.
   * @group Emits
   */
  onNodeUnselect = new EventEmitter();
  /**
   * Callback to invoke when a node is expanded.
   * @param {OrganizationChartNodeExpandEvent} event - custom node expand event.
   * @group Emits
   */
  onNodeExpand = new EventEmitter();
  /**
   * Callback to invoke when a node is collapsed.
   * @param {OrganizationChartNodeCollapseEvent} event - custom node collapse event.
   * @group Emits
   */
  onNodeCollapse = new EventEmitter();
  templates;
  togglerIconTemplate;
  templateMap;
  _togglerIconTemplate;
  selectionSource = new Subject();
  _selection;
  initialized;
  selectionSource$ = this.selectionSource.asObservable();
  _componentStyle = inject(OrganizationChartStyle);
  constructor(el, cd) {
    super();
    this.el = el;
    this.cd = cd;
  }
  get root() {
    return this.value && this.value.length ? this.value[0] : null;
  }
  ngAfterContentInit() {
    if (this.templates.length) {
      this.templateMap = {};
    }
    this.templates.forEach((item) => {
      if (item.getType() === "togglericon") {
        this._togglerIconTemplate = item.template;
      } else {
        this.templateMap[item.getType()] = item.template;
      }
    });
    this.initialized = true;
  }
  getTemplateForNode(node) {
    if (this.templateMap) return node.type ? this.templateMap[node.type] : this.templateMap["default"];
    else return null;
  }
  onNodeClick(event, node) {
    let eventTarget = event.target;
    if (eventTarget.className && (R(eventTarget, "p-organizationchart-node-toggle-button") || R(eventTarget, "p-organizationchart-node-toggle-button-icon"))) {
      return;
    } else if (this.selectionMode) {
      if (node.selectable === false) {
        return;
      }
      let index = this.findIndexInSelection(node);
      let selected = index >= 0;
      if (this.selectionMode === "single") {
        if (selected) {
          this.selection = null;
          this.onNodeUnselect.emit({
            originalEvent: event,
            node
          });
        } else {
          this.selection = node;
          this.onNodeSelect.emit({
            originalEvent: event,
            node
          });
        }
      } else if (this.selectionMode === "multiple") {
        if (selected) {
          this.selection = this.selection.filter((val, i) => i != index);
          this.onNodeUnselect.emit({
            originalEvent: event,
            node
          });
        } else {
          this.selection = [...this.selection || [], node];
          this.onNodeSelect.emit({
            originalEvent: event,
            node
          });
        }
      }
      this.selectionChange.emit(this.selection);
      this.selectionSource.next(null);
    }
  }
  findIndexInSelection(node) {
    let index = -1;
    if (this.selectionMode && this.selection) {
      if (this.selectionMode === "single") {
        index = this.selection == node ? 0 : -1;
      } else if (this.selectionMode === "multiple") {
        for (let i = 0; i < this.selection.length; i++) {
          if (this.selection[i] == node) {
            index = i;
            break;
          }
        }
      }
    }
    return index;
  }
  isSelected(node) {
    return this.findIndexInSelection(node) != -1;
  }
  static ɵfac = function OrganizationChart_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _OrganizationChart)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(ChangeDetectorRef));
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _OrganizationChart,
    selectors: [["p-organizationChart"], ["p-organization-chart"], ["p-organizationchart"]],
    contentQueries: function OrganizationChart_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        ɵɵcontentQuery(dirIndex, _c4, 4);
        ɵɵcontentQuery(dirIndex, PrimeTemplate, 4);
      }
      if (rf & 2) {
        let _t;
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.togglerIconTemplate = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.templates = _t);
      }
    },
    hostVars: 3,
    hostBindings: function OrganizationChart_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵattribute("data-pc-section", "root");
        ɵɵclassMap(ctx.cn(ctx.cx("root"), ctx.styleClass));
      }
    },
    inputs: {
      value: "value",
      styleClass: "styleClass",
      selectionMode: "selectionMode",
      collapsible: [2, "collapsible", "collapsible", booleanAttribute],
      preserveSpace: [2, "preserveSpace", "preserveSpace", booleanAttribute],
      selection: "selection"
    },
    outputs: {
      selectionChange: "selectionChange",
      onNodeSelect: "onNodeSelect",
      onNodeUnselect: "onNodeUnselect",
      onNodeExpand: "onNodeExpand",
      onNodeCollapse: "onNodeCollapse"
    },
    features: [ɵɵProvidersFeature([OrganizationChartStyle]), ɵɵInheritDefinitionFeature],
    decls: 1,
    vars: 1,
    consts: [["pOrganizationChartNode", "", 3, "class", "collapsible", "node", 4, "ngIf"], ["pOrganizationChartNode", "", 3, "collapsible", "node"]],
    template: function OrganizationChart_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵtemplate(0, OrganizationChart_table_0_Template, 1, 4, "table", 0);
      }
      if (rf & 2) {
        ɵɵproperty("ngIf", ctx.root);
      }
    },
    dependencies: [CommonModule, NgIf, OrganizationChartNode, SharedModule],
    encapsulation: 2
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(OrganizationChart, [{
    type: Component,
    args: [{
      selector: "p-organizationChart, p-organization-chart, p-organizationchart",
      standalone: true,
      imports: [CommonModule, OrganizationChartNode, SharedModule],
      template: ` <table [class]="cx('table')" [collapsible]="collapsible" pOrganizationChartNode [node]="root" *ngIf="root"></table> `,
      changeDetection: ChangeDetectionStrategy.Default,
      providers: [OrganizationChartStyle],
      host: {
        "[attr.data-pc-section]": "'root'",
        "[class]": "cn(cx('root'), styleClass)"
      }
    }]
  }], () => [{
    type: ElementRef
  }, {
    type: ChangeDetectorRef
  }], {
    value: [{
      type: Input
    }],
    styleClass: [{
      type: Input
    }],
    selectionMode: [{
      type: Input
    }],
    collapsible: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    preserveSpace: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    selection: [{
      type: Input
    }],
    selectionChange: [{
      type: Output
    }],
    onNodeSelect: [{
      type: Output
    }],
    onNodeUnselect: [{
      type: Output
    }],
    onNodeExpand: [{
      type: Output
    }],
    onNodeCollapse: [{
      type: Output
    }],
    templates: [{
      type: ContentChildren,
      args: [PrimeTemplate]
    }],
    togglerIconTemplate: [{
      type: ContentChild,
      args: ["togglericon", {
        descendants: false
      }]
    }]
  });
})();
var OrganizationChartModule = class _OrganizationChartModule {
  static ɵfac = function OrganizationChartModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _OrganizationChartModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _OrganizationChartModule,
    imports: [OrganizationChart, OrganizationChartNode, SharedModule],
    exports: [OrganizationChart, OrganizationChartNode, SharedModule]
  });
  static ɵinj = ɵɵdefineInjector({
    imports: [OrganizationChart, OrganizationChartNode, SharedModule, SharedModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(OrganizationChartModule, [{
    type: NgModule,
    args: [{
      imports: [OrganizationChart, OrganizationChartNode, SharedModule],
      exports: [OrganizationChart, OrganizationChartNode, SharedModule]
    }]
  }], null, null);
})();
export {
  OrganizationChart,
  OrganizationChartClasses,
  OrganizationChartModule,
  OrganizationChartNode,
  OrganizationChartStyle
};
/*! Bundled license information:

@angular/animations/fesm2022/animations.mjs:
  (**
   * @license Angular v20.3.2
   * (c) 2010-2025 Google LLC. https://angular.io/
   * License: MIT
   *)
*/
//# sourceMappingURL=primeng_organizationchart.js.map
