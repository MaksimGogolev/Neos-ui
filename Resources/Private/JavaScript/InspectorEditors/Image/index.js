import React, {Component, PropTypes} from '@host/react';
import {api} from '@host';
import {$set, $drop, $get} from 'plow-js';
import {Maybe} from 'monet';

import {PreviewScreen, Controls, Secondary} from './Components/index';
import {Image} from './Utils/index';

const DEFAULT_FEATURES = {
    crop: true,
    resize: false
};

const RESIZE_IMAGE_ADJUSTMENT = [
    'object',
    'adjustments',
    'TYPO3\\Media\\Domain\\Model\\Adjustment\\ResizeImageAdjustment'
];
const CROP_IMAGE_ADJUSTMENT = [
    'object',
    'adjustments',
    'TYPO3\\Media\\Domain\\Model\\Adjustment\\CropImageAdjustment'
];

const SECONDARY_NONE = 1;
const SECONDARY_DETAILS = 2;
const SECONDARY_MEDIA = 3;
const SECONDARY_CROPPER = 4;

export default class ImageEditor extends Component {
    static propTypes = {
        value: PropTypes.oneOfType([
            PropTypes.shape({
                __identifier: PropTypes.string
            }),
            PropTypes.string
        ]),
        commit: PropTypes.func.isRequired,

        options: PropTypes.object,

        // Public API:
        // I18N key
        fileChooserLabel: PropTypes.string,

        features: PropTypes.shape({
            crop: PropTypes.bool,
            resize: PropTypes.bool
        }),

        allowedFileTypes: PropTypes.string
    };

    static defaultProps = {
        allowedFileTypes: 'jpg,jpeg,png,gif,svg'
    };

    state = {
        secondaryScreenMode: SECONDARY_NONE,
        image: null
    };

    componentDidMount() {
        if (this.props.value && this.props.value.__identity) {
            this.loadImage = api.media.image.loadMetaData(this.props.value)
                .then(image => this.setState({image}));
        }

        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.value || !nextProps.value.__identity) {
            this.setState({image: null});
        }

        if (this.props.value && this.props.value.__identity &&
            nextProps.value.__identity !== this.props.value.__identity) {
            api.media.image.loadMetaData(nextProps.value)
                .then(image => this._isMounted && this.setState({image}));
        }
    }

    isFeatureEnabled(featureName) {
        const features = Object.assign({}, DEFAULT_FEATURES, this.props.features);
        return features[featureName];
    }

    onCrop(cropArea) {
        const {commit, value} = this.props;
        const {image} = this.state;

        const imageWidth = $get('originalDimensions.width', image);
        const imageHeight = $get('originalDimensions.height', image);
        const cropAdjustments = {
            x: Math.round(cropArea.x / 100 * imageWidth),
            y: Math.round(cropArea.y / 100 * imageHeight),
            width: Math.round(cropArea.width / 100 * imageWidth),
            height: Math.round(cropArea.height / 100 * imageHeight)
        };
        const nextimage = $set(CROP_IMAGE_ADJUSTMENT, cropAdjustments, image);

        this.setState({image: nextimage});

        commit(value, {
            'Neos.UI:Hook.BeforeSave.CreateImageVariant': nextimage
        });
    }

    onResize(resizeAdjustment) {
        const {commit, value} = this.props;
        const {image} = this.state;
        const nextimage = resizeAdjustment ?
            $set(RESIZE_IMAGE_ADJUSTMENT, resizeAdjustment, image) : $drop(RESIZE_IMAGE_ADJUSTMENT, image);

        this.setState({image: nextimage});

        commit(value, {
            'Neos.UI:Hook.BeforeSave.CreateImageVariant': nextimage
        });
    }

    closeSecondaryScreen() {
        this.setState({secondaryScreenMode: SECONDARY_NONE});
    }

    toggleSecondaryScreen(mode) {
        const {secondaryScreenMode} = this.state;

        if (secondaryScreenMode === mode) {
            this.closeSecondaryScreen();
        } else {
            this.setState({secondaryScreenMode: mode});
        }
    }

    onRemoveFile() {
        const {commit, value} = this.props;

        this.closeSecondaryScreen();
        this.setState({image: null});
        commit($set('__identity', '', value));
    }

    onMediaSelected(assetIdentifier) {
        const {commit, value} = this.props;

        this.closeSecondaryScreen();
        this.setState({image: null});
        commit($set('__identity', assetIdentifier, value));
        api.media.image.loadMetaData($set('__identity', assetIdentifier, value))
            .then(image => this.setState({image}));
    }

    onThumbnailClicked() {
        const imageIdentity = $get('__identity', this.props.value);

        if (imageIdentity) {
            this.toggleSecondaryScreen(SECONDARY_DETAILS);
        } else {
            this.onChooseFile();
        }
    }

    onChooseFile() {
        const {previewScreen} = this.refs;
        previewScreen.chooseFromLocalFileSystem();
    }

    upload(files) {
        const {commit} = this.props;

        api.media.asset.upload(files[0]).then(res => {
            this.setState({image: res});
            commit(res.object);
        });
    }

    render() {
        const {image, secondaryScreenMode} = this.state;

        return (
            <div>
                <PreviewScreen
                    ref="previewScreen"
                    image={image}
                    onDrop={files => this.upload(files)}
                    onClick={() => this.onThumbnailClicked()}
                    />
                <Controls
                    onChooseFromMedia={() => this.toggleSecondaryScreen(SECONDARY_MEDIA)}
                    onChooseFromLocalFileSystem={() => this.onChooseFile()}
                    onRemove={() => this.onRemoveFile()}
                    onCrop={this.isFeatureEnabled('crop') && (() => this.toggleSecondaryScreen(SECONDARY_CROPPER))}
                    />
                {
                    Maybe.fromNull(secondaryScreenMode !== SECONDARY_NONE || null)
                        .map(() => this.renderSecondaryScreen()).orSome('')
                }
            </div>
        );
    }

    renderSecondaryScreen() {
        const {secondaryScreenMode, image} = this.state;
        const {options} = this.props;
        const {__identity} = this.props.value;

        switch (secondaryScreenMode) {
            case SECONDARY_MEDIA:
                return (
                    <Secondary.MediaSelectionScreen
                        onClose={() => this.toggleSecondaryScreen(SECONDARY_NONE)}
                        onComplete={assetIdentifier => this.onMediaSelected(assetIdentifier)}
                        />
                );

            case SECONDARY_DETAILS:
                return (
                    <Secondary.MediaDetailsScreen
                        onClose={() => this.toggleSecondaryScreen(SECONDARY_NONE)}
                        imageIdentity={__identity}
                        />
                );

            case SECONDARY_CROPPER:
                return (
                    <Secondary.ImageCropper
                        sourceImage={Image.fromImageData(image)}
                        options={options}
                        onClose={() => this.toggleSecondaryScreen(SECONDARY_NONE)}
                        onComplete={cropArea => this.onCrop(cropArea)}
                        />
                );

            case SECONDARY_NONE:
            default:
                return '';
        }
    }
}
