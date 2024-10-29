let enabledMapMode
let mapInstance
let drawType
let mapSourceId
let isFirstClick
const MAP_MODES = {
    ADD: "ADDING",
    EDIT: "EDITING",
    DELETE: "DELETING",
}
const DRAW_TYPE = {
    POLYGON: "Polygon",
    LINE: "Line",
    POINT: "Point",
    CIRCLE: "Circle",
}
let polygonFeature = {
    "type": "Feature",
    "geometry": {
        "type": "Polygon",
        "coordinates":
            [[]]
    },
    "properties": {
        "type": "",
        "name": "",
        "nameAr": ""
    }
}
let getLayers = () => {
    return {
        POINTS_LAYER: {
            "id": "POINTS_LAYER",
            "type": "circle",
            "source": "TEMP_SOURCE",
            minzoom: 8.5,
            "paint": {
                "circle-color": "#FF8b3d",
                "circle-radius": 8.5,
                "circle-opacity": 0.8,
                "circle-stroke-width": 2,
                "circle-stroke-color": "#FFFFFF"
            }
        },
        TEMP_LAYER: {
            id: "EDITED_PRE_DEFINED_AREA_LAYER",
            type: "fill",
            source: "TEMP_SOURCE",
            minzoom: 8.5,
            layout: {
                visibility: "visible",
            },
            paint: {
                "fill-color": "#000000",
                "fill-opacity": 0.5
            }
        },
        DASH_LINE_LAYER: {
            "id": "EDIT_FEATURE_DASH_LINE_LAYER_ID",
            "type": "line",
            "source": "TEMP_SOURCE",
            minzoom: 8.5,
            "paint": {
                "line-dasharray": [
                    4,
                    2
                ],
                "line-color": "#FF8b3d",
                "line-width": 4,
                "line-opacity": 0.8
            }
        },
        MIDDLE_POINTS_LAYER: {
            "id": "MIDDLE_POINTS_LAYER",
            "type": "circle",
            "source": "MIDDLE_POINTS_TEMP_SOURCE",
            minzoom: 8.5,
            "paint": {
                "circle-color": "#FF8b3d",
                "circle-radius": 8.5,
                "circle-opacity": 0.5,
                "circle-stroke-width": 2,
                "circle-stroke-color": "#FFFFFF"
            }
        },
        POLYGON_LAYER: {
            id: "polygonLayer",
            type: "fill",
            source: mapSourceId,
            minzoom: 8.5,
            layout: {
                visibility: "visible",
            },
            paint: {
                "fill-color": "#000000",
                "fill-opacity": 0.45
            }
        }
    }
}
let sources = {
    MIDDLE_POINTS_TEMP_SOURCE: {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    },
    TEMP_SOURCE: {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    }
}
let TEMP_SOURCE = "TEMP_SOURCE"
let MIDDLE_POINTS_TEMP_SOURCE = "MIDDLE_POINTS_TEMP_SOURCE"

let initializeMapEditor = (map, options) => {
    mapInstance = map
    let events = ['click', 'dblclick', 'mousedown', 'mouseup', 'mousemove']
    events.forEach(eventType => {
        mapInstance.on(eventType, handleMapEvent);
    });
}

let startDrawing = async (type, sourceId) => {
    drawType = type
    mapSourceId = sourceId
    enabledMapMode = MAP_MODES.ADD
    await addSources([ "TEMP_SOURCE"])
}

let startEditing = (sourceId) => {
    enabledMapMode = MAP_MODES.EDIT

}

let startDeleting = (sourceId) => {
    enabledMapMode = MAP_MODES.DELETE
}

let handleMapEvent = async (e) => {
    switch (enabledMapMode) {
        case MAP_MODES.ADD:
            await onMapAdding(e)
            break;
        case MAP_MODES.EDIT:
            onMapEditing(e)
            break;
        case MAP_MODES.DELETE:
            onMapDeleting(e)
            break;
    }
}

let onMapAdding = async (event) => {
    switch (drawType) {
        case DRAW_TYPE.POINT:
            onAddPoint(event)
            break;
        case DRAW_TYPE.LINE:
            onAddLine(event)
            break;
        case DRAW_TYPE.POLYGON:
            await onAddPolygon(event)
            break;
        case DRAW_TYPE.CIRCLE:
            onAddCircle(event)
            break;
    }
}

let onMapEditing = (event) => {
    switch (drawType) {
        case DRAW_TYPE.POINT:
            onEditPoint(event)
            break;
        case DRAW_TYPE.LINE:
            onEditLine(event)
            break;
        case DRAW_TYPE.POLYGON:
            onEditPolygon(event)
            break;
        case DRAW_TYPE.CIRCLE:
            onEditCircle(event)
            break;
    }
}

let onMapDeleting = (event) => {
}

let onAddCircle = (event) => {
}

let onEditCircle = (event) => {
}

let onAddPolygon = async (event) => {
    switch (event.type) {
        case 'click':
            let feature = await getFeatureFromSource(TEMP_SOURCE)
            if (!feature) {
                await addLayers(["TEMP_LAYER"])
                let newFeature = {...polygonFeature}
                newFeature.geometry.coordinates=[[]]
                newFeature.geometry.coordinates[0].push([event.lngLat.lng, event.lngLat.lat]);
                newFeature.geometry.coordinates[0].push([event.lngLat.lng, event.lngLat.lat]);
                await appendFeatureToSource(TEMP_SOURCE, newFeature)
            } else {
                 feature = await getFeatureFromSource(TEMP_SOURCE)
                let coordinates = feature.geometry.coordinates[0]
                coordinates?.splice(coordinates?.length - 1, 0, [event.lngLat.lng, event.lngLat.lat]);
                await updateFeature(TEMP_SOURCE, feature)
            }
            break;
        case 'mousemove':
            break;
        case 'dblclick':
            drawType = ""
            break;
    }
}

let onEditPolygon = (event) => {
}

let onAddLine = (event) => {
}

let onEditLine = (event) => {
}

let onAddPoint = (event) => {
}

let onEditPoint = (event) => {
}

let addSources = async (sourcesNames) => {
    for (const source of sourcesNames) {
        await mapInstance?.addSource(source, sources[source])
    }
}

let addLayers = async (layersNames) => {
    for (const layer of layersNames) {
        await mapInstance?.addLayer(getLayers()[layer])
    }
}

let appendFeatureToSource = async (source, feature) => {
    let data = await mapInstance?.getSource(source)?.getData()
    data?.features?.push(feature)
    mapInstance?.getSource(source)?.setData(data)
}
let updateFeature = async (source, updatedFeature, index) => {
    let data = await mapInstance?.getSource(source)?.getData()
    data.features[index ?? data?.features?.length - 1] = updatedFeature
    mapInstance?.getSource(source)?.setData(data)
}

let getFeatureFromSource = async (sourceId) => {
    let data = await mapInstance?.getSource(sourceId)?.getData()
    return data.features[0]
}