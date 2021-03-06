import React, {Component, PropTypes} from 'react';
import omit from 'lodash.omit';
import mergeClassNames from 'classnames';
import enhanceWithClickOutside from 'react-click-outside';
import {executeCallback} from 'Shared/Utilities/index';
import Icon from 'Components/Icon/index';
import style from './style.css';

export class DropDown extends Component {
    static propTypes = {
        className: PropTypes.string,
        isOpen: PropTypes.bool.isRequired,
        children: PropTypes.node.isRequired
    };

    static defaultProps = {
        isOpen: false
    };

    static childContextTypes = {
        isOpen: PropTypes.bool.isRequired,
        toggleDropDown: PropTypes.func.isRequired,
        closeDropDown: PropTypes.func.isRequired
    };

    constructor(props, context) {
        super(props, context);

        this.state = {isOpen: false};
    }

    getChildContext() {
        return {
            isOpen: this.state.isOpen,
            toggleDropDown: () => this.toggle(),
            closeDropDown: () => this.close()
        };
    }

    render() {
        const {children, className, ...rest} = this.props;
        const directProps = omit(rest, ['isOpen']);
        delete directProps.isOpened;
        const dropDownClassName = mergeClassNames({
            [className]: className && className.length,
            [style.dropDown]: true
        });

        return (
            <div className={dropDownClassName} {...directProps}>
                {children}
            </div>
        );
    }

    handleClickOutside() {
        this.close();
    }

    close() {
        this.setState({isOpen: false});
    }

    toggle() {
        this.setState({isOpen: !this.state.isOpen});
    }
}

export class Header extends Component {
    static propTypes = {
        className: PropTypes.string,
        children: PropTypes.node
    };
    static contextTypes = {
        isOpen: PropTypes.bool.isRequired,
        toggleDropDown: PropTypes.func.isRequired
    };

    constructor(props, context) {
        super(props, context);
    }

    render() {
        const {className, children, ...directProps} = this.props;
        const {isOpen, toggleDropDown} = this.context;
        const classNames = mergeClassNames({
            [style.dropDown__btn]: true,
            [className]: className && className.length
        });
        const chevron = this.renderChevronIcon();

        return (
            <button
                onClick={e => executeCallback({e, cb: () => toggleDropDown()})}
                ref={btn => {
                    const method = isOpen ? 'focus' : 'blur';

                    // Initially focus the btn if the propType was set.
                    if (btn !== null) {
                        btn[method]();
                    }
                }}
                className={classNames}
                aria-haspopup="true"
                {...directProps}
                >
                {children}
                {chevron}
            </button>
        );
    }

    renderChevronIcon() {
        const {isOpen} = this.context;
        const iconName = isOpen ? 'chevron-up' : 'chevron-down';

        return <Icon icon={iconName} className={style.dropDown__chevron} />;
    }
}

export class Contents extends Component {
    static propTypes = {
        className: PropTypes.string,
        children: PropTypes.node.isRequired
    };

    static contextTypes = {
        isOpen: PropTypes.bool.isRequired,
        closeDropDown: PropTypes.func.isRequired
    };

    constructor(props, context) {
        super(props, context);
    }

    render() {
        const {className, children, ...directProps} = this.props;
        const {isOpen, closeDropDown} = this.context;
        const contentsClassName = mergeClassNames({
            [className]: className && className.length,
            [style.dropDown__contents]: true,
            [style['dropDown__contents--isOpen']]: isOpen
        });
        const ariaIsHiddenLabel = isOpen ? 'false' : 'true';

        return (
            <ul
                className={contentsClassName}
                aria-hidden={ariaIsHiddenLabel}
                aria-label="dropdown"
                {...directProps}
                onClick={() => closeDropDown()}
                role="button"
                >
                {children}
            </ul>
        );
    }
}

//
// Add the click-outside functionality to the DropDown component.
//
const EnhancedDropDown = enhanceWithClickOutside(DropDown);

//
// Assign the Child Component to the parent,
// to replicate the structure of a `DropDown` Component.
//
EnhancedDropDown.Header = Header;
EnhancedDropDown.Contents = Contents;

export default EnhancedDropDown;
