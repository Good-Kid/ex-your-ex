import React from "react";
import { Link } from "react-router-dom";

const LinkButton = ({ to, children, ...props }) => (
    <Link to={to} {...props}>
        <button className="link-button quattrocento-bold" type="button">
            {children}
        </button>
    </Link>
);

export default LinkButton;
