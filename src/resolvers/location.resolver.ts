
import { LocationArgs, LocationCreateDTO, LocationUpdateDTO } from "@/dtos/location.dto";
import { LocationRepository } from "@/repositories/location.repository";
import { Locations, Location } from "@/typedefs/location.type";
import { Arg, Args, Authorized, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class LocationResolver extends LocationRepository{

  // @Authorized()
  @Query(() => Locations, {
    description: 'List All Locations',
  })
  async listLocations(): Promise<Locations> {
      const locations: Locations = await this.locationList();
      return locations;
  }

  // @Authorized()
  @Mutation(() => Location, {
    description: 'Create Location',
  })
  async createLocation(@Arg('locationData') locationData : LocationCreateDTO): Promise<Location> {
    const location: Location = await this.locationAdd(locationData);
    return location;
  }

  // @Authorized()
  @Query(() => Location, {
    description: "Get Location by Id, slug or name",
  })
  async getLocation(@Args(){id, slug, name}: LocationArgs): Promise<Location> {
    const location: Location = await this.locationFind({id, slug, name});
    return location;
  }

  // @Authorized()
  @Mutation(() => Location, {
    description: 'Remove Location',
  })
  async removeLocation(@Arg('locationId') locationId: number): Promise<Location> {
    const location: Location = await this.locationRemove(locationId);
    return location;
  }

  // @Authorized()
  @Mutation(() => Location, {
    description: 'Update Location',
  })
  async updateLocation(@Arg('locationId') locationId: number, @Arg('locationData') locationData: LocationUpdateDTO): Promise<Location> {
    const location: Location = await this.locationUpdate(locationId, locationData);
    return location;
  }
}
