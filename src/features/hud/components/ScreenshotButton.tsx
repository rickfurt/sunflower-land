import React, { useState } from "react";

import html2canvas from "html2canvas";
import screenshotIcon from "assets/icons/screenshot-icon.png";
import button from "assets/ui/button/round_button.png";
import { Modal, ModalTitle } from "react-bootstrap";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";

export const ScreenshotButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ssImg, setSSImg] = useState("");

  const handleTweetClick = () => {
    window.open(
      "https://twitter.com/intent/tweet?text=Checkout%20my%20Sunflower%20Land%20Farm%3A%0A%0A&ref_src=https%3A%2F%2Fsunflower-land.com&hashtags=SunflowerLand",
      "_blank"
    );
    // setIsOpen(false);
  };

  const clearUrl = (url: string) => url.replace(/^data:image\/\w+;base64,/, "");

  const downloadImage = (
    name: string = "My Sunflower Land Farm",
    content: string,
    type: string = "jpeg"
  ) => {
    let link: HTMLAnchorElement = document.createElement("a");
    // link.style = "position: fixed; left -10000px;";
    link.href = `data:application/octet-stream;base64,${encodeURIComponent(
      content
    )}`;
    link.download = /\.\w+/.test(name) ? name : `${name}.${type}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveImage = () =>
    downloadImage("My Farm", clearUrl(ssImg), "jpeg");

  function getScreenshot(): void {
    html2canvas(document.body)
      .then(async function (canvas: HTMLCanvasElement): Promise<string> {
        const img: string = await canvas.toDataURL("image/jpeg");
        return img;
      })
      .then((img: string) => {
        setSSImg(img);
        setIsOpen(true);
        // window.open("", "_blank")?.document.write('<img src="' + img + '" />');
      });
  }

  return (
    <div className="position-fixed flex bottom-44 p-1 right-2 w-fit z-50 cursor-pointer">
      <Button onClick={() => getScreenshot()}>
        <img
          src={screenshotIcon}
          className="w-8 mb-1 sm:w-6 sm:h-5"
          alt="screenshot"
        />
      </Button>
      {/* <Label className="hidden sm:block absolute -bottom-7">Screenshot</Label> */}
      <Modal centered show={isOpen} onHide={() => setIsOpen(false)}>
        <Panel>
          <Modal.Header closeButton>
            <h1>Show off to fellow farmers</h1>
          </Modal.Header>
          <Modal.Body>
            <div className="flex justify-content-center">
              <div className="flex flex-wrap h-fit">
                <img
                  src={ssImg}
                  id="ss-image"
                  alt="Screenshot of Farm"
                  style={{ maxHeight: "40vh" }}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="justify-content-center">
            <Button className="text-s w-1/4 px-1" onClick={handleSaveImage}>
              Save
            </Button>
            <Button className="text-s w-1/4 px-1" onClick={handleTweetClick}>
              Tweet
            </Button>
          </Modal.Footer>
        </Panel>
      </Modal>
    </div>
  );
};
