module Chemotion
  class SampleAPI < Grape::API
    # TODO ensure user is authenticated

    include Grape::Kaminari

    resource :samples do

      #todo: more general search api
      desc "Return serialized samples"
      params do
        optional :collection_id, type: Integer, desc: "Collection id"
      end
      paginate per_page: 5, max_per_page: 25, offset: 0

      get do
        scope = if params[:collection_id]
          Collection.where("user_id = ? OR shared_by_id = ?", current_user.id, current_user.id).find(params[:collection_id]).samples.includes(:molecule)
        else
          Sample.includes(:molecule)
        end.order("created_at DESC")

        paginate(scope)
      end

      desc "Return serialized sample by id"
      params do
        requires :id, type: Integer, desc: "Sample id"
      end
      route_param :id do
        get do
          Sample.find(params[:id])
        end
      end


      desc "Update sample by id"
      params do
        requires :id, type: Integer, desc: "Sample id"
        requires :name, type: String, desc: "Sample name"
        requires :amount_value, type: Float, desc: "Sample amount_value"
        requires :amount_unit, type: String, desc: "Sample amount_unit"
        requires :description, type: String, desc: "Sample description"
        requires :purity, type: Float, desc: "Sample purity"
        requires :solvent, type: String, desc: "Sample solvent"
        requires :impurities, type: String, desc: "Sample impurities"
        requires :location, type: String, desc: "Sample location"
        optional :molfile, type: String, desc: "Sample molfile"
        optional :molecule, type: Hash, desc: "Sample molecule"
      end
      put ':id' do

        attributes = {
          name: params[:name],
          amount_value: params[:amount_value],
          amount_unit: params[:amount_unit],
          description: params[:description],
          purity: params[:purity],
          solvent: params[:solvent],
          impurities: params[:impurities],
          location: params[:location],
          molfile: params[:molfile]
        }

        attributes.merge!(
          molecule_attributes: params[:molecule]
        ) unless params[:molecule].blank?

        Sample.find(params[:id]).update(attributes)
      end

      desc "Create a sample"
      params do
        requires :name, type: String, desc: "Sample name"
        requires :amount_value, type: Float, desc: "Sample amount_value"
        requires :amount_unit, type: String, desc: "Sample amount_unit"
        requires :description, type: String, desc: "Sample description"
        requires :purity, type: Float, desc: "Sample purity"
        requires :solvent, type: String, desc: "Sample solvent"
        requires :impurities, type: String, desc: "Sample impurities"
        requires :location, type: String, desc: "Sample location"
        optional :molfile, type: String, desc: "Sample molfile"
        optional :molecule, type: Hash, desc: "Sample molecule"
      end
      post do
        attributes = {
          name: params[:name],
          amount_value: params[:amount_value],
          amount_unit: params[:amount_unit],
          description: params[:description],
          purity: params[:purity],
          solvent: params[:solvent],
          impurities: params[:impurities],
          location: params[:location],
          molfile: params[:molfile]
        }
        attributes.merge!(
          molecule_attributes: params[:molecule]
        ) unless params[:molecule].blank?
        Sample.create(attributes)
      end


    end
  end
end
