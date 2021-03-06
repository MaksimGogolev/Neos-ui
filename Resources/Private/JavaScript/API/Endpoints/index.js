import {api} from 'Shared/Utilities/';

export const change = changes => fetch('/neos!/service/change', {
    method: 'POST',
    credentials: 'include',
    headers: {
        'X-Flow-Csrftoken': api.getCsrfToken(),
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        changes
    })
}).then(response => response.json());

export const publish = (nodeContextPaths, targetWorkspaceName) => fetch('/neos!/service/publish', {
    method: 'POST',
    credentials: 'include',
    headers: {
        'X-Flow-Csrftoken': api.getCsrfToken(),
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        nodeContextPaths,
        targetWorkspaceName
    })
}).then(response => response.json());

export const discard = nodeContextPaths => fetch('/neos!/service/discard', {
    method: 'POST',
    credentials: 'include',
    headers: {
        'X-Flow-Csrftoken': api.getCsrfToken(),
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        nodeContextPaths
    })
}).then(response => response.json());

export const loadImageMetadata = imageVariantUuid => fetch(`neos/content/image-with-metadata?image=${imageVariantUuid}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json'
    }
}).then(response => response.json());

/**
 * asset[adjustments][TYPO3\Media\Domain\Model\Adjustment\CropImageAdjustment][height]:85
 * asset[adjustments][TYPO3\Media\Domain\Model\Adjustment\CropImageAdjustment][position]:10
 * asset[adjustments][TYPO3\Media\Domain\Model\Adjustment\CropImageAdjustment][width]:210
 * asset[adjustments][TYPO3\Media\Domain\Model\Adjustment\CropImageAdjustment][x]:0
 * asset[adjustments][TYPO3\Media\Domain\Model\Adjustment\CropImageAdjustment][y]:0
 * asset[originalAsset]:56d183f2-ee66-c845-7e2d-40661fb27571
 * @param asset
 */
export const createImageVariant = (originalAssetUuid, adjustments) => fetch('neos/content/create-image-variant', {
    method: 'POST',
    credentials: 'include',
    headers: {
        'X-Flow-Csrftoken': api.getCsrfToken(),
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        asset: {
            originalAsset: originalAssetUuid,
            adjustments
        }
    })
}).then(response => response.json());

export const uploadAsset = (file, siteNodeName, metadata = 'Image') => {
    const data = new FormData();
    data.append('__siteNodeName', siteNodeName);
    data.append('asset[resource]', file);
    data.append('metadata', metadata);

    return fetch('neos/content/upload-asset', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'X-Flow-Csrftoken': api.getCsrfToken()
        },
        body: data
    }).then(response => response.json());
};
