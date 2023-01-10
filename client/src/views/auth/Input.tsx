import React from "react";

const Input:React.FunctionComponent = (props) => {
    const input = React.createElement('input', {
        ...props
    });

    return(
        <div>
            {input}
        </div>
    ) 
}
export default Input;