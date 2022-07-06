import React from 'react';

import { ComponentMeta, ComponentStory } from '@storybook/react';

import { MetadataPanel } from '../components/shared/MetadataPanel';
import "../assets/scss/App.scss";
export default {
    /* 👇 The title prop is optional.
    * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
    * to learn how to generate automatic titles
    */
    title: 'MetadataPanel',
    component: MetadataPanel,
} as ComponentMeta<typeof MetadataPanel>;

//👇 We create a “template” of how args map to rendering
const Template = (args) => <MetadataPanel {...args} />;
//👇 Each story then reuses that template
export const ComicVine = Template.bind({});
ComicVine.args = {
    data: {
        "_id": { "$oid": "62bb40c82089f1ea67997e0d" },
        "__v": 0,
        "acquisition": { "source": { "wanted": false } },
        "createdAt": { "$date": { "$numberLong": "1656438984852" } },
        "importStatus": {
          "isImported": true,
          "tagged": false,
          "matchedResult": { "score": "0" }
        },
        "inferredMetadata": {
          "issue": {
            "name": "Fantastic Four 143",
            "number": 197402,
            "year": "1974",
            "subtitle": ""
          }
        },
        "rawFileDetails": {
          "name": "197402 Fantastic Four 143",
          "filePath": "/Users/rishi/work/threetwo-core-service/comics/197402 Fantastic Four 143.cbz",
          "fileSize": 10341074,
          "extension": ".cbz",
          "containedIn": "./userdata/covers/197402 Fantastic Four 143",
          "cover": {
            "filePath": "userdata/covers/197402 Fantastic Four 143/FF143_01.jpg"
          }
        },
        "sourcedMetadata": { "comicInfo": null, "comicvine": { "aliases": [] } },
        "updatedAt": { "$date": { "$numberLong": "1656438984852" } }
      },

    imageStyle: { maxWidth: 120 },
    titleStyle: { fontSize: "0.8rem" },
    tagsStyle: { fontSize: "0.7rem" },
    containerStyle: {
        width: "530px",
        padding: 0,
        margin: "0 0 8px 0",
    }
}
