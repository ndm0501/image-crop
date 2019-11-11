import React from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// maximum image size accepted
const maxSize = 10000000;
//accepted file types
const acceptedTypes = "image/png, image/jpg, image/jpeg, image/png";
const fileTypeArray = acceptedTypes.split(",").map(type => type.trim());

class ImageCrop extends React.Component {
  constructor() {
    super();
    this.imageRef = React.createRef();
    this.canvasRef = React.createRef();
    this.croppedImageRef = React.createRef();
    this.state = {
      selectedOption: null,
      croppedImage: null,
      src: null,
      crop: {
        aspect: null
      }
    };
  }
  //check file size and type
  fileVerify = files => {
    if (files && files.length > 0) {
      const fileType = files[0].type;
      const fileSize = files[0].size;
      if (fileSize > maxSize) {
        alert(
          "File size too big! Maximum allowed file size is " +
            maxSize / 1000000 +
            " MB"
        );
        return false;
      }
      if (!fileTypeArray.includes(fileType)) {
        alert("Please choose a valid image file!");
        return false;
      }
      return true;
    }
  };
  //handle file upload
  handleFile = e => {
    if (e.target.files && e.target.files.length > 0) {
      if (this.fileVerify(e.target.files)) {
        const fileReader = new FileReader();
        fileReader.addEventListener("load", () => {
          this.setState({ src: fileReader.result });
        });
        fileReader.readAsDataURL(e.target.files[0]);
      }
    }
  };
  //handle loaded image
  onImageLoaded = image => {
    this.imageRef = image;
  };
  //handle crop changes
  onCrop = crop => {
    this.setState({ crop });
    return false;
  };
  //on crop complete, create final image
  onComplete = crop => {
    this.createFinalImage(crop);
  };

  createFinalImage = async crop => {
    if (this.imageRef && crop.width && crop.height) {
      const croppedImage = await this.getCroppedImage(
        this.imageRef,
        crop,
        "newFile.jpeg"
      );
      this.setState({ croppedImage });
        window.scrollTo(0, this.croppedImageRef.current.offsetTop);
    }
  };

  getCroppedImage = (image, crop, fileName) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          console.error("Canvas is empty");
          return;
        }
        blob.name = fileName;
        window.URL.revokeObjectURL(this.fileUrl);
        this.fileUrl = window.URL.createObjectURL(blob);
        resolve(this.fileUrl);
      }, "image/jpeg");
    });
  };
  handleCheck = async e => {
    await this.setState({
      selectedOption: e.target.value,
      crop: { ...this.state.crop, aspect: null }
    });
    if (this.state.selectedOption === "select") {
      console.log(true);
      this.setState({ crop: { ...this.state.crop, aspect: 16 / 9 } });
    }
  };

  selectAspectRatio = e => {
    const ratio = e.target.value.split("/");
    if (e.target.value !== "") {
      const crop = { ...this.state.crop, aspect: ratio[0] / ratio[1] };
      this.setState({ crop });
    }
  };
  clearImage = e => {
    e.preventDefault();
    this.setState({
      selectedOption: null,
      croppedImage: null,
      src: null,
      crop: { aspect: null }
    });
  };
  render() {
    console.log(this.state);
    const { src, crop, croppedImage, selectedOption } = this.state;
    return (
      <div>
        <h1>Crop Image</h1>
        <input
          type="file"
          multiple={false}
          accept={acceptedTypes}
          onChange={this.handleFile}
        />
        <br />
        <br />

        <form className="form form-group">
          {selectedOption === "select" ? (
            <div>
              <label>
                <input
                  type="radio"
                  value="custom"
                  checked={selectedOption === "custom"}
                  onChange={this.handleCheck}
                />
                Free Size Crop
              </label>
            </div>
          ) : null}
          <div>
            <label>
              <input
                type="radio"
                value="select"
                checked={selectedOption === "select"}
                onChange={this.handleCheck}
              />
              Select Aspect Ratio
            </label>
          </div>
          {src !== null ? (
            <div>
              <button onClick={this.clearImage}>Clear</button>
            </div>
          ) : null}
          {selectedOption === "select" ? (
            <div>
              <select onChange={this.selectAspectRatio}>
                <option value="16/9">16:9</option>
                <option value="4/3">4:3</option>
                <option value="1/1">1:1</option>
              </select>
            </div>
          ) : null}
        </form>

        <br />
        <div className="container" style={{maxWidth: "600px"}}>
          <ReactCrop
            src={src}
            crop={crop}
            onChange={this.onCrop}
            onImageLoaded={this.onImageLoaded}
            onComplete={this.onComplete}
          />
        </div>
        <br />

        {croppedImage && (
          <div className="container">
            <h3>Preview</h3>
            <img
              ref={this.croppedImageRef}
              style={{ maxWidth: "100%" }}
              src={croppedImage}
              alt="Preview cropped image!"
            />{" "}
            <br />
            <button onClick={() => alert("Functionality yet to be added!")}>
              Download
            </button>
          </div>
        )}
      </div>
    );
  }
}
export default ImageCrop;
