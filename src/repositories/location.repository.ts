import { LocationCreateDTO, LocationArgs, LocationUpdateDTO, NominatimSearchDTO } from "@/dtos/location.dto";
import { LocationEntity } from "@/entities/location.entity";
import { HttpException } from "@/exceptions/httpException";
import { Locations, Location } from "@/interfaces/location.interface";
import { NominatimLocation, NominatimLocations } from "@/typedefs/location.type";
import { EntityRepository } from "typeorm";
// import fetch from "node-fetch";
import axios from 'axios'


@EntityRepository(LocationEntity)
export class LocationRepository{
  public async locationSearch(nominatimQuery:NominatimSearchDTO): Promise<NominatimLocations> {
    const {status, data} = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(nominatimQuery.query)}&format=json&addressdetails=1&limit=5&polygon_svg=1`, {
      headers: {
        "accept-language" : "en-us",
        "user-agent": "Swojon Web Application"
      }
    })
    // const data:any = await response.json()
    // console.log("data", data)
    const locations = data.map(loc => { 
        return {
            lat: loc.lat, 
            lon: loc.lon, 
            placeId: loc.place_id, 
            displayName: loc.display_name, 
            // address: loc.address,
            locality: loc.address.locality ?? loc.address.natural ?? loc.address.village,
            city: loc.address.city,
            stateDistrict: loc.address.state_district,
            state : loc.address.state,
            country: loc.address.country,
            postCode: loc.address.postcode
          }})
    // console.log("locations", locations)
    return {items: locations}
  } 
  
  // public async reverseNominatim(nominatimQuery:NominatimSearchDTO): Promise<NominatimLocation>{
  //   // @incomplete
  //   console.log(nominatimQuery.lat, nominatimQuery.lon)
  //   const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${nominatimQuery.lat}&lon=${nominatimQuery.lon}&format=json&addressdetails=1&limit=5`, {
  //     headers: {
  //       "accept-language" : "en-us",
  //       "user-agent": "Swojon Web Application"
  //     }
  //   })
    
  //   const data = await response.json()
  //   console.log(data)
  //   return {}
  // }
  public async locationList(): Promise<Locations> {
    // const getLocationTree = (locations:LocationEntity[], target: Location|null):Location[] =>{

    //   let locs = locations.filter(cat => target === null? cat.parentLocation === null: cat.parentLocation?.id === target.id)
    //   const locationList:Location[] = []

    //   locs.forEach(cat => {
    //     locationList.push({
    //       ...cat,
    //       children: getLocationTree(locations, cat)
    //     })
    //   });

    //   return locationList
    // }
    const findLocations = await LocationEntity.findAndCount(
      {
        select: ["id", "name", "slug", "description", "banner",
          "isLive", "isDeleted", "isFeatured", "parentLocation"],
        relations: ['parentLocation'],
      }
    );
    const locationList = findLocations[0]
    // const locationTree: Location[] =  getLocationTree(locationList, null)

    return {items: locationList}

  }

  public async locationAdd(locationData: LocationCreateDTO): Promise<Location> {
    const findLocation: LocationEntity = await LocationEntity.findOne({ where:
                    [{ name: locationData?.name }, {slug:locationData?.slug}]
                    });
    if (findLocation) throw new HttpException(409, `Location with name ${locationData.name} already exists`);
    let parentLocation:LocationEntity|null = null;

    if (locationData.parentLocationId) {
      parentLocation  = await LocationEntity.findOne({where: {id: locationData.parentLocationId}});
      if (!parentLocation) throw new HttpException(409, `Parent Location with id ${locationData.parentLocationId} does not exist`);
    }

    const createLocationData: LocationEntity = await LocationEntity.create({...locationData, parentLocation}).save();

    return createLocationData;
  }

  public async locationRemove(locationId: number): Promise<Location> {
    const findLocation: LocationEntity = await LocationEntity.findOne({ where: { id: locationId } });
    if (!findLocation) throw new HttpException(409, `Location with id ${locationId} does not exist`);

    await LocationEntity.delete({ id: locationId });

    return findLocation;
  }

  public async locationFind(locationArgs: LocationArgs): Promise<LocationEntity> {
    const findLocation: LocationEntity = await LocationEntity.findOne(
                    {
                      where: [
                          {id: locationArgs?.id},
                          {slug: locationArgs?.slug},
                          {name: locationArgs?.name}],
                      relations: ['parentLocation']
                    },

              );
    if (!findLocation) throw new HttpException(409, `Location not found`);
    return findLocation;
  }

  public async locationUpdate(locationId: number, locationData: LocationUpdateDTO): Promise<Location> {
    const location: LocationEntity = await LocationEntity.findOne({ where: { id: locationId } });
    if (!location) throw new HttpException(409, `Location with id ${locationId} does not exist`);
    let dataToUpdate: any = locationData;
    Object.keys(dataToUpdate).forEach(key => {
      if (!dataToUpdate[key] ) {
        delete dataToUpdate[key];
      }
    });

    await LocationEntity.update({ id: locationId }, dataToUpdate);

    const updatedLocation: LocationEntity = await LocationEntity.findOne({ where: { id: locationId }, relations: ['parentLocation'] });
    return updatedLocation;

  }

}
