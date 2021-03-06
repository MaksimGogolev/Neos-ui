<?php
namespace Neos\Neos\Ui\TypoScript;

use TYPO3\Flow\Annotations as Flow;
use TYPO3\TypoScript\TypoScriptObjects\AbstractTypoScriptObject;

class AppendToCollectionImplementation extends AbstractTypoScriptObject
{
    /**
     * Appends an item to the given collection
     *
     * @return string
     */
    public function evaluate()
    {
        $collection = $this->tsValue('collection');
        $key = $this->tsValue('key');
        $item = $this->tsValue('item');

        if ($key) {
            $collection[$key] = $item;
        } else {
            $collection[] = $item;
        }

        return $collection;
    }
}
