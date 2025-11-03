import kitItemDefinitions from "../../data/kitItemDefinitions";

const KitMobileMenu = ({ clickCallback, style = {} }) => {
    return (
        <div id="KitMobileMenu" style={style}>
            {Object.entries(kitItemDefinitions).map(([itemId, kitItem]) => (
                <div key={itemId} onClick={() => clickCallback(itemId)}>
                    <div className="item-frame">
                        <img src={kitItem.imageSrc} alt="" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KitMobileMenu;
