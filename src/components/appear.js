/* eslint-disable react/no-did-mount-set-state */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import findKey from 'lodash/findKey';
import { connect } from 'react-redux';
import { VictoryAnimation } from 'victory-core';

class Appear extends Component {
  state = {
    // active: false,
    activeAnimation: -1
  };

  componentDidMount() {
    const shouldDisableAnimation =
      this.props.route.params.indexOf('export') !== -1 ||
      this.props.route.params.indexOf('overview') !== -1;

    if (shouldDisableAnimation) {
      // this.setState({ active: true });
      this.setState({ activeAnimation: this.props.endValue.length - 1 });
      return;
    }

    const order = this.props.order || 0;
    const node = findDOMNode(this.fragmentRef);
    if (!node.dataset) {
      node.dataset = {};
    }
    node.dataset.order = order;
  }

  componentWillReceiveProps(nextProps) {
    const state = nextProps.fragment;
    const slide = this.props.route.slide;
    const fragment = findDOMNode(this.fragmentRef);
    const slideHash = parseInt(this.context.slideHash);
    const key = findKey(state.fragments[slide], {
      id: `${slideHash}-${parseInt(fragment.dataset.fid)}`,
    });

    const shouldDisableAnimation =
    nextProps.route.params.indexOf('export') !== -1 ||
    nextProps.route.params.indexOf('overview') !== -1;

    if (shouldDisableAnimation) {
      // this.setState({ active: true });
      this.setState({ activeAnimation: this.props.endValue.length - 1 });
      return;
    }

    if (
      slide in state.fragments &&
      state.fragments[slide].hasOwnProperty(key)
    ) {
      // const active = state.fragments[slide][key].visible;
      const animationStatus = state.fragments[slide][key].animations;
      this.context.stepCounter.setFragments(state.fragments[slide], slide);
      this.setState({ activeAnimation: animationStatus.indexOf(false) - 1 });
    }
  }

  render() {
    const {
      children,
      startValue,
      endValue,
      transitionDuration,
      easing,
      style
    } = this.props;
    const child = React.Children.only(children);
    const tweenData = this.state.activeAnimation === -1 ? startValue : endValue[this.state.activeAnimation];
    return (
      <VictoryAnimation
        data={tweenData}
        duration={transitionDuration}
        easing={easing}
      >
        {(tweenStyle) =>
          React.cloneElement(child, {
            className: `fragment ${child.props.className}`.trim(),
            style: { ...child.props.style, ...style, ...tweenStyle },
            ref: f => {
              this.fragmentRef = f;
            },
            'data-animation-count': this.props.endValue.length
          })}
      </VictoryAnimation>
    );
  }
}

Appear.defaultProps = {
  transitionDuration: 300,
  startValue: { opacity: 0 },
  endValue: { opacity: 1 },
  easing: 'quadInOut'
};

Appear.propTypes = {
  children: PropTypes.node,
  easing: PropTypes.oneOf([
    'back', 'backIn', 'backOut', 'backInOut',
    'bounce', 'bounceIn', 'bounceOut', 'bounceInOut',
    'circle', 'circleIn', 'circleOut', 'circleInOut',
    'linear', 'linearIn', 'linearOut', 'linearInOut',
    'cubic', 'cubicIn', 'cubicOut', 'cubicInOut',
    'elastic', 'elasticIn', 'elasticOut', 'elasticInOut',
    'exp', 'expIn', 'expOut', 'expInOut',
    'poly', 'polyIn', 'polyOut', 'polyInOut',
    'quad', 'quadIn', 'quadOut', 'quadInOut',
    'sin', 'sinIn', 'sinOut', 'sinInOut'
  ]),
  endValue: PropTypes.object,
  fragment: PropTypes.object,
  order: PropTypes.number,
  route: PropTypes.object,
  startValue: PropTypes.object,
  style: PropTypes.object,
  transitionDuration: PropTypes.number
};

Appear.contextTypes = {
  export: PropTypes.bool,
  overview: PropTypes.bool,
  slide: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  slideHash: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  stepCounter: PropTypes.shape({
    setFragments: PropTypes.func
  })
};

export default connect(state => state)(Appear);
