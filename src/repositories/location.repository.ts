import { LocationCreateDTO, LocationArgs, LocationUpdateDTO } from "@/dtos/location.dto";
import { LocationEntity } from "@/entities/location.entity";
import { HttpException } from "@/exceptions/httpException";
import { Locations, Location } from "@/interfaces/location.interface";
import { EntityRepository } from "typeorm";



@EntityRepository(LocationEntity)
export class LocationRepository{

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

    await LocationEntity.update({ id: locationId }, locationData);

    const updatedLocation: LocationEntity = await LocationEntity.findOne({ where: { id: locationId }, relations: ['parentLocation'] });
    return updatedLocation;

  }

}
