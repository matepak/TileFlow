import React from 'react';
import PackeryGallery from './PackeryGallery';

const GalleryDemo = () => {
    // Sample images array
    const demoImages = [
        {
            id: 1,
            url: 'https://picsum.photos/400/300',
            alt: 'Demo image 1',
            caption: 'Random image 1'
        },
        {
            id: 2,
            url: 'https://picsum.photos/300/400',
            alt: 'Demo image 2',
            caption: 'Random image 2'
        },
        {
            id: 3,
            url: 'https://picsum.photos/500/300',
            alt: 'Demo image 3',
            caption: 'Random image 3'
        },
        {
            id: 4,
            url: 'https://picsum.photos/400/400',
            alt: 'Demo image 4',
            caption: 'Random image 4'
        },
        {
            id: 5,
            url: 'https://picsum.photos/450/300',
            alt: 'Demo image 5',
            caption: 'Random image 5'
        },
        {
            id: 6,
            url: 'https://picsum.photos/350/450',
            alt: 'Demo image 6',
            caption: 'Random image 6'
        }
    ];

    return (
        <div className="gallery-demo">
            <h1>Packery Image Gallery Demo</h1>
            <p className="demo-description">
                A responsive image gallery with customizable grid layout and draggable items.
                Try adjusting the settings and dragging images to rearrange them.
            </p>
            <PackeryGallery images={demoImages} />
        </div>
    );
};

export default GalleryDemo; 