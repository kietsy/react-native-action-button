'use strict';

var React = require('react-native');
var {
  Component,
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  TouchableOpacity,
  PixelRatio,
  Dimensions,
} = React;

var sW = Dimensions.get('window').width,
    ActionButtonItem = require('./ActionButtonItem');


class ActionButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: this.props.active || false,
      hide: this.props.hide || false,
      type: this.props.type || 'float', // float | tab
      bgColor: this.props.bgColor || 'transparent',
      buttonColor: this.props.buttonColor || 'rgba(0,0,0,1)',
      buttonTextColor: this.props.buttonTextColor || 'rgba(255,255,255,1)',
      spacing: this.props.spacing || 20
    }

    this.state.anim = this.props.active ? new Animated.Value(1) : new Animated.Value(0);
    this.state.hideAnim = this.props.hide ? new Animated.Value(1) : new Animated.Value(0);

    if (!props.children) throw new Error("ActionButton must have at least 1 Child.");

    if (Array.isArray(props.children)) {
      this.state.actionButtons = props.children;
    } else {
      this.state.actionButtons = [props.children];
    }

    this.setPositionAndSizeByType();
  }

  propTypes: {
    active: React.PropTypes.bool,
    hide: React.PropTypes.bool,

    type: React.PropTypes.string,
    position: React.PropTypes.string,

    bgColor: React.PropTypes.string,
    buttonColor: React.PropTypes.string,
    buttonTextColor: React.PropTypes.string,

    offsetX : React.PropTypes.number,
    offsetY: React.PropTypes.number,
    spacing: React.PropTypes.number,
    size: React.PropTypes.number,
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.active !== undefined) {
      this.setState({
        active: nextProps.active
      }, () => this.animateButton())
    }

    if (nextProps.hide !== undefined) {
      this.setState({
        hide: nextProps.hide
      }, () => this.animateOffScreen())
    }
  }

  setPositionAndSizeByType() {
    let position, offsetX, offsetY, size;

    if (this.state.type == 'tab') {
      position = 'center',
      offsetX  = 10,
      offsetY  = 4,
      size     = 42;
    } else {
      position = 'right',
      offsetX  = 30,
      offsetY  = 30,
      size     = 64;
    }

    this.state.position = this.props.position || position;
    this.state.offsetX  = this.props.offsetX  || offsetX ;
    this.state.offsetY  = this.props.offsetY  || offsetY;
    this.state.size     = this.props.size     || size;
  }


  //////////////////////
  // STYLESHEET GETTERS
  //////////////////////

  getContainerStyles() {
    if (this.state.active) return styles.overlay
    return [ styles.actionBarPos, this.getButtonSize(), this.getOffsetXY() ]
  }

  getActionButtonStyles() {
    if (this.state.active) return [
      styles.actionBarItem,
      styles.actionBarPos,
      this.getButtonSize(),
      this.getOffsetXY(),
      this.moveOffscreen()
    ]

    return [
      styles.actionBarItem,
      this.getButtonSize(),
      this.moveOffscreen()
    ]
  }

  moveOffscreen () {
    return {
      transform: [
        {
          translateY: this.state.hideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, this.state.size + this.state.offsetY]
          })
        }
      ]
    }
  }

  getButtonSize() {
    return {
      width: this.state.size,
      height: this.state.size,
    }
  }

  getOffsetXY() {
    if (this.state.position == 'center') return { left: sW/2 - this.state.size/2, bottom: this.state.offsetY }
    if (this.state.position == 'left')   return { left: this.state.offsetX, bottom: this.state.offsetY }
    return { right: this.state.offsetX, bottom: this.state.offsetY }
  }

  getActionsStyle() {
    let alignItems = 'center';
    if (this.state.position == 'left')  alignItems = 'flex-start';
    if (this.state.position == 'right') alignItems = 'flex-end';

    return [
      styles.actionsVertical,
      {
        paddingHorizontal: 11 + this.state.offsetX,
        paddingBottom: this.state.size + this.state.offsetY,
        backgroundColor: this.state.bgColor,
        alignItems: alignItems,
      }
    ]
  }


  //////////////////////
  // RENDER METHODS
  //////////////////////

  render() {
    return (
      <View style={this.getContainerStyles()}>
        {this._renderActions()}
        {this._renderButton()}
      </View>
    );
  }

  _renderButton() {
    let btnSize = this.state.size / 1.2;
    return (
      <Animated.View style={this.getActionButtonStyles()}>
        <TouchableOpacity activeOpacity={0.8} onPress={this.animateButton.bind(this)}>
          <View
            style={[styles.btn, {
              width: btnSize,
              height: btnSize,
              borderRadius: btnSize/2,
            }, styles.shadow]}>
            <Animated.View
              style={[styles.btn, {
                width: btnSize,
                height: btnSize,
                borderRadius: btnSize/2,
                backgroundColor: this.state.buttonColor,
                transform: [
                  {
                    rotate: this.state.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '135deg']
                    })
                  },
                ],
              }]}>
              <Text style={[styles.btnText, {color: this.state.buttonTextColor}]}>
                +
              </Text>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  _renderActions() {
    if (!this.state.active) return;

    return (
      <Animated.View style={[styles.overlay, { opacity: this.state.anim }]}>
        <TouchableOpacity activeOpacity={1} onPress={this.reset.bind(this)}
          style={this.getActionsStyle()}>
          {this.state.actionButtons.map((ActionButton, iter) => {
            return (<ActionButtonItem
            		  key = {iter}
                      position={this.state.position}
                      spacing={this.state.spacing}
                      anim={this.state.anim}
                      size={this.state.size}
                      {...ActionButton.props}
                      onPress={() => {
                        this.reset()
                        ActionButton.props.onPress();
                      }} />)
          })}
        </TouchableOpacity>
      </Animated.View>
    );
  }


  //////////////////////
  // Animation Methods
  //////////////////////

  animateButton() {
    if(!this.state.active) {
      Animated.timing(
        this.state.anim,
        {
          toValue: 1,
          duration: 350,
          easing: Easing.elastic(1.5),
        }
      ).start();

      this.setState({ active: true });
    } else {
      this.reset();
    }
  }

  reset() {
    Animated.timing(
      this.state.anim,
      {
        toValue: 0,
        duration: 450,
        easing: Easing.elastic(2),
      }
    ).start();

    setTimeout(() => {
      this.setState({ active: false });
    }, 450)
  }

  animateOffScreen() {
    if (this.state.hide) {
      Animated.timing(
        this.state.hideAnim, {
          toValue: 1,
          duration: 350,
          easing: Easing.elastic(1),
        }
      ).start()
    } else {
      this.resetOffScreen()
    }
  }

  resetOffScreen () {
    Animated.timing(
      this.state.hideAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.elastic(1),
      }
    ).start()
  }
}


var styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'transparent',
  },
  actionBarPos: {
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  actionBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: {
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.8,
  },
  btnText: {
    marginTop: -4,
    fontSize: 24,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  actionsVertical: {
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'column',
  },
});

ActionButton.Item = ActionButtonItem;

module.exports = ActionButton;
