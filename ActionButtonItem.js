'use strict';

var React = require('react-native');
var {
  Component,
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
} = React;


let actionBtnWidth = 0;

class ActionButtonItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spaceBetween: 10,
      offsetTop: props.size > 42 ? 17 : 10,
    };

    if (!props.children || Array.isArray(props.children)) throw new Error("ActionButtonItem must have a Child component.");

    if(this.props.size > 0) actionBtnWidth = this.props.size;
  }

  render() {
    return (
      <Animated.View style={
        [
          styles.actionButtonWrap,
          {
            marginBottom: this.props.spacing,
            opacity: this.props.anim,
            transform: [
              {
                translateY: this.props.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0]
                }),
              },
            ],
          }
        ]
      }>
        <TouchableOpacity style={{flex:1}} onPress={this.props.onPress}>
          <View style={[styles.actionButton, this.props.style,
            {
              width: actionBtnWidth,
              height: actionBtnWidth,
              borderRadius: actionBtnWidth/2,
              backgroundColor: this.props.buttonColor || 'white'
            }
          ]}>
            {this.props.children}
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={this.getTextStyles()} onPress={this.props.onPress}>
          <Text style={this.actionTextOnly}>{this.props.title}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  getTextStyles() {
    let positionStyles = {
      right: actionBtnWidth + this.state.spaceBetween,
      top: this.state.offsetTop - 3
    }

    if (this.props.position == 'left') positionStyles = {
      left: actionBtnWidth + this.state.spaceBetween,
      top: this.state.offsetTop
    }

    return [styles.actionText, positionStyles]
  }
}

var styles = StyleSheet.create({
  actionButtonWrap: {
    alignItems: 'center',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: 2,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.8,
  },
  actionTextOnly: {
    color: '#9E9E9E',
    fontFamily: 'Avenir',
    fontSize: 14,
    fontWeight: '600',
  },
  actionText: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 5,
    shadowRadius: 0.25,
    shadowOffset: {
      width: 0,
      height: 0.25,
    },
    shadowOpacity: 0.8,
  },
});

module.exports = ActionButtonItem;
