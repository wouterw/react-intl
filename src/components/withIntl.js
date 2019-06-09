import * as React from 'react';
import {isValidElementType} from 'react-is';
import {invariantIntlContext} from '../utils';
import * as invariant_ from 'invariant';
// Since rollup cannot deal with namespace being a function,
// this is to interop with TypeScript since `invariant`
// does not export a default
// https://github.com/rollup/rollup/issues/1267
const invariant = invariant_;
import * as hoistNonReactStatics_ from 'hoist-non-react-statics';
// Since rollup cannot deal with namespace being a function,
// this is to interop with TypeScript since `invariant`
// does not export a default
// https://github.com/rollup/rollup/issues/1267
const hoistNonReactStatics = hoistNonReactStatics_;

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

const IntlContext = React.createContext(null);
const {Consumer: IntlConsumer, Provider: IntlProvider} = IntlContext;

export const Provider = IntlProvider;
export const Context = IntlContext;

export default function withIntl(componentOrOptions, options) {
  if (isValidElementType(componentOrOptions)) {
    // use call to make `options` available on `this`
    return createWrapper.call({options}, componentOrOptions);
  }
  // return a function with `options` bound to `this`
  return createWrapper.bind({options: componentOrOptions});
}

function createWrapper(WrappedComponent) {
  let options = (this && this.options) || {};
  const {
    intlPropName = 'intl',
    forwardRef = false,
    // DEPRECATED - use forwardRef and ref on injected component
    withRef = false,
    enforceContext = true,
  } = options;

  invariant(
    !withRef,
    '[React Intl] withRef and getWrappedInstance() are deprecated, ' +
      "instead use the 'forwardRef' option and create a ref directly on the wrapped component."
  );

  class WithIntl extends React.Component {
    static displayName = `withIntl(${getDisplayName(WrappedComponent)})`;
    static WrappedComponent = WrappedComponent;

    render() {
      return (
        <IntlConsumer>
          {intl => {
            if (enforceContext) {
              invariantIntlContext({intl});
            }

            return (
              <WrappedComponent
                {...{
                  ...this.props,
                  [intlPropName]: intl,
                }}
                ref={forwardRef ? this.props.forwardedRef : null}
              />
            );
          }}
        </IntlConsumer>
      );
    }
  }

  if (forwardRef) {
    return hoistNonReactStatics(
      React.forwardRef((props, ref) => (
        <WithIntl {...props} forwardedRef={ref} />
      )),
      WrappedComponent
    );
  }

  return hoistNonReactStatics(WithIntl, WrappedComponent);
}
