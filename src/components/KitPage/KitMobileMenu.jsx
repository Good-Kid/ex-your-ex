import React, { useMemo } from "react";
import kitItemDefinitions from "../../data/kitItemDefinitions";

const resolveMenuImageSrc = (itemId, def, flags) => {
    // default
    let src = def.imageSrc;

    // game-state overrides (mirror your KitPage logic)
    if (itemId === "bottle" && flags?.bottleCompleted) {
        src = "/images/kit/full/bottle_full.png";
    }
    if (itemId === "cassette" && !flags?.cassetteCompleted) {
        // use whatever your “broken/unwound” menu asset is
        src = "/images/kit/full/cassette_unwound.png";
    }

    return src;
};

const KitMobileMenu = ({ clickCallback, style = {}, gameFlags }) => {
    // Optional: memoize the resolved list so it recomputes when flags change
    const items = useMemo(() => {
        return Object.entries(kitItemDefinitions).map(([itemId, def]) => ({
            itemId,
            name: def.name,
            imageSrc: resolveMenuImageSrc(itemId, def, gameFlags),
        }));
    }, [gameFlags]);

    return (
        <div id="KitMobileMenu" style={style}>
            {items.map(({ itemId, name, imageSrc }) => (
                <div key={itemId} onClick={() => clickCallback(itemId)}>
                    <div className="item-frame">
                        <img src={imageSrc} alt={name ?? itemId} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KitMobileMenu;
