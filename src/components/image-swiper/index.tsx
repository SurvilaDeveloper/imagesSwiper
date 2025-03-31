"use client";

import React, { useEffect, useRef, useState } from "react";
import "./images-sample.css";

interface ImagesSampleProps {
    id?: string;
    imageArray: { src: string; alt: string }[];
    numberShowen?: number;
    navigation?: string;
    gridTemplateColumns?: string;
    gridTemplateRows?: string;
    gap?: string;
    justifyItems?: string;
    alignItems?: string;
    color?: string;
    backgroundColor?: string;
    children?: React.ReactNode;
}

/**
 * Muestrario de imágenes clickeable para abrir un swiper en fullscreen
 * @param imageArray - Un array con objetos tipo {src: string; alt: string}
 * @param numberShowen - Cantidad de imágenes a mostrar en la grilla clickeable
 * @param navigation - Navegación, puede ser: thumbnails, dots o numbers
 * @param gridTemplateColumns - Cantidad de columnas en la grilla. Ejemplo: gridTemplateColumns={"repeat(3, 1fr)"}
 * @param gap - Separación entre los elementos
 * @param backgroundColor - Color del fondo
 * @returns 
 */
export const ImagesSwiper: React.FC<ImagesSampleProps> = ({
    id,
    imageArray,
    numberShowen = 5,
    navigation = "thumbnails",
    gridTemplateColumns = "1fr",
    gridTemplateRows = "auto",
    gap = "4px",
    justifyItems = "stretch",
    alignItems = "stretch",
    color = "black",
    backgroundColor = "white",
    children,
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const dragOffsetRef = useRef(0);
    const [dragOffset, setDragOffset] = useState(0);
    const dragStartX = useRef<number | null>(null);
    const dragThreshold = 100;
    const [indexState, setIndexState] = useState(0);
    const elementRef = useRef<HTMLDivElement>(null);
    const thumbnailsRef = useRef<HTMLDivElement>(null);
    const [isResizing, setIsResizing] = useState(false);

    // Control de redimensionamiento
    useEffect(() => {
        let resizeTimeout: NodeJS.Timeout;

        const handleResize = () => {
            setIsResizing(true);
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                setIsResizing(false);
            }, 200);
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            clearTimeout(resizeTimeout);
        };
    }, []);

    // Navegación por miniaturas
    const goToSlide = (index: number) => {
        setIndexState(index); // Ajusta el estado del índice
        setCurrentSlide(index); // Actualiza la miniatura activa
        setDragOffset(0); // Resetea el desplazamiento
    };

    // Control de deslizamiento (mouse y toque)
    const handleMouseDown = (event: React.MouseEvent) => {
        event.preventDefault();
        dragStartX.current = event.clientX;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (dragStartX.current !== null) {
            const dragDistance = event.clientX - dragStartX.current;
            dragOffsetRef.current = dragDistance;
            setDragOffset(dragDistance);
        }
    };

    const handleMouseUp = () => {
        finalizeDrag();
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };

    const handleTouchStart = (event: React.TouchEvent) => {
        dragStartX.current = event.touches[0].clientX;
    };

    const handleTouchMove = (event: React.TouchEvent) => {
        if (dragStartX.current !== null) {
            const dragDistance = event.touches[0].clientX - dragStartX.current;
            dragOffsetRef.current = dragDistance;
            setDragOffset(dragDistance);
        }
    };

    const handleTouchEnd = () => {
        finalizeDrag();
    };

    const finalizeDrag = () => {
        if (dragStartX.current !== null) {
            if (dragOffsetRef.current > dragThreshold) {
                prevSlide();
            } else if (dragOffsetRef.current < -dragThreshold) {
                nextSlide();
            } else {
                setDragOffset(0);
            }
            dragOffsetRef.current = 0;
        }
        dragStartX.current = null;
    };

    const nextSlide = () => {
        if (indexState === imageArray.length - 1) {
            setIndexState(imageArray.length - 1);
            setCurrentSlide(imageArray.length - 1);
        } else {
            setIndexState((prev) => prev + 1);
            setCurrentSlide((prev) => (prev + 1) % imageArray.length);
        }

        setDragOffset(0);
    };

    const prevSlide = () => {
        if (indexState === 0) {
            setIndexState(0)
            setCurrentSlide(0)
        } else {
            setIndexState((prev) => prev - 1);
            setCurrentSlide((prev) => (prev - 1 + imageArray.length) % imageArray.length);
        }
        setDragOffset(0);
    };

    // Control de desplazamiento de miniaturas
    const handleThumbnailMouseDown = (event: React.MouseEvent) => {
        event.preventDefault();
        dragStartX.current = event.clientX;
        document.addEventListener("mousemove", handleThumbnailMouseMove);
        document.addEventListener("mouseup", handleThumbnailMouseUp);
    };

    const handleThumbnailMouseMove = (event: MouseEvent) => {
        if (dragStartX.current !== null && thumbnailsRef.current) {
            const dragDistance = dragStartX.current - event.clientX;
            thumbnailsRef.current.scrollLeft += dragDistance;
            dragStartX.current = event.clientX;
        }
    };

    const handleThumbnailMouseUp = () => {
        dragStartX.current = null;
        document.removeEventListener("mousemove", handleThumbnailMouseMove);
        document.removeEventListener("mouseup", handleThumbnailMouseUp);
    };

    const handleThumbnailTouchStart = (event: React.TouchEvent) => {
        dragStartX.current = event.touches[0].clientX;
    };

    const handleThumbnailTouchMove = (event: React.TouchEvent) => {
        if (dragStartX.current !== null && thumbnailsRef.current) {
            const dragDistance = dragStartX.current - event.touches[0].clientX;
            thumbnailsRef.current.scrollLeft += dragDistance;
            dragStartX.current = event.touches[0].clientX;
        }
    };

    const handleThumbnailTouchEnd = () => {
        dragStartX.current = null;
    };

    return (
        <>
            <div
                id={id}
                className="bot-photo-sample-grid"
                style={{
                    gridTemplateColumns,
                    gridTemplateRows,
                    gap,
                    justifyItems,
                    alignItems,
                    color,
                    backgroundColor,
                }}
            >
                {imageArray.slice(0, numberShowen).map((img, index) => (
                    <img
                        key={index}
                        src={img.src}
                        alt={img.alt}
                        className="bot-photo-sample-image"
                        onClick={() => {
                            setIsFullscreen(true)
                            setIndexState(index)
                            setCurrentSlide(index)
                        }}
                        role="button"
                        aria-label={`Abrir imagen ${index + 1}`}
                    />
                ))}
                {imageArray.length > numberShowen && (
                    <span onClick={() => setIsFullscreen(true)}>{`${imageArray.length - numberShowen} más...`}</span>
                )}
                {children}
            </div>
            {isFullscreen && (
                <div
                    className="fullscreen-carousel"
                    ref={elementRef}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{ cursor: "grab" }}
                >
                    <button
                        className="close-button"
                        onClick={() => setIsFullscreen(false)}
                        aria-label="Cerrar pantalla completa"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 36 36"
                            width="36"
                            height="36"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                                backgroundColor: "rgba(0,0,0,0.5)",
                                borderRadius: "50%", // Opcional: hace que el fondo sea circular.
                                padding: "4px", // Opcional: ajusta el espacio interno para crear margen entre el fondo y las líneas del SVG.
                            }}
                        >
                            <path d="M4 4 l28 28 M32 4l -28 28" />
                        </svg>

                    </button>
                    <div
                        className="carousel-slide"
                        style={{
                            position: "relative",
                            left:
                                dragOffset === 0
                                    ? `${indexState * -100}vw`
                                    : `calc(${indexState * -100}vw + ${dragOffset}px)`,
                            transition: isResizing ? "none" : dragOffset === 0 ? "left 1s ease" : "none",
                        }}
                    >
                        {imageArray.map((img, index) => (
                            <div key={index} style={{ width: "100vw", display: "flex", justifyContent: "center" }}>
                                <img src={img.src} alt={img.alt} className="carousel-image" />
                            </div>
                        ))}
                    </div>
                    {currentSlide != 0 && (
                        <button
                            className="nav-button prev"
                            onClick={prevSlide}
                            aria-label="Imagen anterior"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 72"
                                width="24"
                                height="72"
                                fill="rgba(0,0,0,0.5)"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M20 70l-16-34 16-34" />
                            </svg>
                        </button>
                    )}
                    {currentSlide != imageArray.length - 1 && (
                        <button
                            className="nav-button next"
                            onClick={nextSlide}
                            aria-label="Siguiente imagen"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 72"
                                width="24"
                                height="72"
                                fill="rgba(0,0,0,0.5)"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M4 70l16-34 -16-34" />
                            </svg>
                        </button>
                    )}
                    <div className="carousel-thumbnails-container"
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center"
                        }}
                    >
                        {navigation === "thumbnails" && (
                            <div
                                className="carousel-thumbnails"
                                ref={thumbnailsRef}
                                onMouseDown={handleThumbnailMouseDown}
                                onTouchStart={handleThumbnailTouchStart}
                                onTouchMove={handleThumbnailTouchMove}
                                onTouchEnd={handleThumbnailTouchEnd}
                                style={{
                                    display: "flex",
                                    overflowX: "hidden",
                                    gap: "4px",
                                    padding: "0px",
                                }}
                            >
                                {imageArray.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img.src}
                                        alt={img.alt}
                                        className={`thumbnail ${index === currentSlide ? "active" : ""}`}
                                        onClick={() => goToSlide(index)}
                                        role="button"
                                        aria-label={`Ir a la imagen ${index + 1}`}
                                        style={{
                                            cursor: "pointer",
                                            border: index === currentSlide ? "2px solid blue" : "none",
                                            flexShrink: 0,
                                            width: "30px",
                                            height: "30px",
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                        {navigation === "dots" && (
                            <div
                                className="carousel-thumbnails"
                                ref={thumbnailsRef}
                                onMouseDown={handleThumbnailMouseDown}
                                onTouchStart={handleThumbnailTouchStart}
                                onTouchMove={handleThumbnailTouchMove}
                                onTouchEnd={handleThumbnailTouchEnd}
                                style={{
                                    display: "flex",
                                    overflowX: "hidden",
                                    gap: "4px",
                                    padding: "0px",
                                }}
                            >
                                {imageArray.map((img, index) => (
                                    <div
                                        key={index}
                                        className={`navigation-dot`}
                                        onClick={() => goToSlide(index)}
                                        role="button"
                                        aria-label={`Ir a la imagen ${index + 1}`}
                                        style={{
                                            color: "white",
                                            cursor: "pointer",
                                            flexShrink: 0,
                                            width: "24px",
                                            height: "24px",
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r={index === currentSlide ? "5" : "3"} fill="currentColor" />
                                        </svg>
                                    </ div>
                                ))}
                            </div>
                        )}
                        {navigation === "numbers" && (
                            <div
                                className="carousel-thumbnails"
                                ref={thumbnailsRef}
                                onMouseDown={handleThumbnailMouseDown}
                                onTouchStart={handleThumbnailTouchStart}
                                onTouchMove={handleThumbnailTouchMove}
                                onTouchEnd={handleThumbnailTouchEnd}
                                style={{
                                    display: "flex",
                                    overflowX: "hidden",
                                    gap: "4px",
                                    padding: "0px",
                                }}
                            >
                                {imageArray.map((img, index) => (
                                    <div
                                        key={index}
                                        className={`navigation-numbers`}
                                        onClick={() => goToSlide(index)}
                                        role="button"
                                        aria-label={`Ir a la imagen ${index + 1}`}
                                        style={{
                                            color: index === currentSlide ? "white" : "gray",
                                            cursor: "pointer",
                                            flexShrink: 0,
                                            width: "24px",
                                            height: "24px",
                                        }}
                                    >
                                        {index + 1}
                                    </ div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};