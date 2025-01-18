import { LocationCreateDTO, LocationArgs, LocationUpdateDTO, NominatimSearchDTO } from "@/dtos/location.dto";
import { LocationEntity } from "@/entities/location.entity";
import { HttpException } from "@/exceptions/httpException";
import { Locations, Location } from "@/interfaces/location.interface";

import axios from 'axios'
import { OrderRatioCheckDTO } from "@/dtos/orderRatio.dto";
import { OrderRatio } from "@/typedefs/orderRatio.type";

function random_choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

export class OrderRatioRepository{
  public async orderRatioCheck(orderRatioQuery:OrderRatioCheckDTO): Promise<OrderRatio> {
    const bdcourier_api_keys = ["nrDv6jKJTca9wLdfumbHYwjfdTzmxNeTofOpFcLc8zLk8IMHF3BaaTDUlvEf", 
      "dEW0GdC0bS35JPXYM2JzxXnM69o2op0C23ZOhsUXEcrafSKWO22essXKvw7u",
      "w3UmUtcTlcswP3TF5cO4OCpDBS9G9rubfK6AHSSvvgysFuc04a2tdyhlLnFM"
    ]
    const {status, data} = await axios.get(`https://bdcourier.com/api/courier-check?phone=${orderRatioQuery.phone}`, {
      headers: {
        "Authorization" : `Bearer ${random_choose(bdcourier_api_keys)}`,
        "user-agent": "Swojon Web Application"
      },
      proxy: {
        protocol: 'http',
        host: 'p.webshare.io',
        port: 80,
        auth: {
          username: 'mshbypwx-rotate',
          password: 's3tfde0p16rs'
        }
      }
    })
    // console.log("data", data)
    // console.log(data)
    const isSuccess = data.status  === "success";
    const courierData = data.courierData
    const orderRatio:OrderRatio = {
      success: isSuccess,
      total_parcel: courierData?.summary?.total_parcel ?? 0,
      success_parcel: courierData?.summary?.success_parcel ?? 0,
      cancelled_parcel: courierData?.summary?.cancelled_parcel ?? 0,
      success_ratio: courierData?.summary?.success_ratio ?? 0,
      pathao: {
        total_parcel: courierData?.pathao?.total_parcel ?? 0,
        success_parcel: courierData?.pathao?.success_parcel ?? 0,
        cancelled_parcel: courierData?.pathao?.cancelled_parcel ?? 0,
        success_ratio: courierData?.pathao?.success_ratio ?? 0
      },
      steadfast: {
        total_parcel: courierData?.steadfast?.total_parcel ?? 0,
        success_parcel: courierData?.steadfast?.success_parcel ?? 0,
        cancelled_parcel: courierData?.steadfast?.cancelled_parcel ?? 0,
        success_ratio: courierData?.steadfast?.success_ratio ?? 0,
      },
      redx: {
        total_parcel: courierData?.redx?.total_parcel ?? 0,
        success_parcel: courierData?.redx?.success_parcel ?? 0,
        cancelled_parcel: courierData?.redx?.cancelled_parcel ?? 0,
        success_ratio: courierData?.redx?.success_ratio ?? 0,
      },
      paperfly: {
        total_parcel: courierData?.paperfly?.total_parcel ?? 0,
        success_parcel: courierData?.paperfly?.success_parcel ?? 0,
        cancelled_parcel: courierData?.paperfly?.cancelled_parcel ?? 0,
        success_ratio: courierData?.paperfly?.success_ratio ?? 0,
      }
    }
  
  return orderRatio 

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
