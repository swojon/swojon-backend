import {MigrationInterface, QueryRunner} from "typeorm";

export class SetupFullTextSearchListing1700041184632 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`
            update listing_entity set document_with_weights = setweight(to_tsvector(title), 'A') ||
                    setweight(to_tsvector(coalesce(description, '')), 'B') ;
    
    CREATE INDEX document_weights_idx
      ON listing_entity
      USING GIN (document_with_weights);
    
            CREATE FUNCTION listing_tsvector_trigger() RETURNS trigger AS $$
    begin
      new.document_with_weights :=
      setweight(to_tsvector('english', coalesce(new.title, '')), 'A')
      || setweight(to_tsvector('english', coalesce(new.description, '')), 'B');
      return new;
    end
    $$ LANGUAGE plpgsql;
    
    CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
        ON listing_entity FOR EACH ROW EXECUTE PROCEDURE listing_tsvector_trigger();
            `);
      }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
