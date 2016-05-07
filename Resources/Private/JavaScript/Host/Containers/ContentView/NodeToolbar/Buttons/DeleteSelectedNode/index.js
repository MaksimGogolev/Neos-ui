import React, {Component, PropTypes} from 'react';
import {IconButton} from 'Components/index';

export default class DeleteSelectedNode extends Component {
    static propTypes = {
        isDisabled: PropTypes.bool,
        className: PropTypes.string
    };

    static defaultProps = {
        isDisabled: true
    };

    render() {
        const {
            isDisabled,
            className
        } = this.props;

        return (
            <IconButton
                className={className}
                isDisabled={isDisabled}
                onClick={this.deleteSelectedNode.bind(this)}
                icon="trash"
                hoverStyle="clean"
                />
        );
    }

    deleteSelectedNode() {
        console.log('delete selected node');
    }
}
