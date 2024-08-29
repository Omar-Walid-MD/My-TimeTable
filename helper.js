import i18n from "./i18n";

export const tableTemplate = {
    name: i18n.t("tables.untitled"),
    content: [
        [],
        [],
        [],
        [],
        []
    ]
};

export function getTimeString(hourString)
{
    if(!hourString) return "00:00";

    let h = parseInt(hourString.split(":")[0]);
    let m = parseInt(hourString.split(":")[1]);
    let t = h < 12 ? "AM" : "PM";
    
    if(t==="AM")
    {
        if(h===0) h = 12;
    }
    else
    {
        if(h!==12) h %= 12;
    }

    return `${h }:${m<10 ? "0"+m : m} ${t}`;
}

export function popup(text)
{
    // dispatch(addPopup({text:i18n.t(`popup.${text}`)}));
}