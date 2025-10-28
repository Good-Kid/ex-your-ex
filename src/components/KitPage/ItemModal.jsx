import React from "react";
import { Link } from "react-router-dom";
import WaveText from "../WaveText";

const ItemModal = ({ selectedItem, onClose }) => {
    if (!selectedItem) return null;

    console.log(selectedItem.noFloat);

    const handleClickOutside = (e) => {
        // Close modal if the click happens directly on the overlay (not inside modal content)
        if (e.target.classList.contains("item-modal")) {
            onClose();
        }
    };

    // Prepare style for modal image div
    const imageConstaintStyles = {};
    if (selectedItem.maxWidth)
        imageConstaintStyles.maxWidth = selectedItem.maxWidth;
    if (selectedItem.maxHeight)
        imageConstaintStyles.maxHeight = selectedItem.maxHeight;
    if (selectedItem.rotation)
        imageConstaintStyles.transform = `rotate(${selectedItem.rotation}deg)`;

    return (
        <div className="item-modal" onClick={handleClickOutside}>
            <div
                className="item-modal-image"
                style={
                    selectedItem.noFloat
                        ? {
                              animation: "none",
                          }
                        : {}
                }
            >
                <img
                    src={selectedItem.imageSrc}
                    alt={selectedItem.name}
                    style={imageConstaintStyles}
                />
            </div>

            <div className="item-modal-text">
                <div className="item-name typewriter">
                    <WaveText intensity="low">{selectedItem.name}</WaveText>
                </div>
                <p>{selectedItem.description}</p>
                {selectedItem.inspectLink && (
                    <Link
                        to={selectedItem.inspectLink}
                        className="inspect-link"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Inspect &gt;
                    </Link>
                )}
            </div>
        </div>
    );
};

export default ItemModal;
